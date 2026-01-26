"use server";

import { prisma } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkUpstashLimit } from "@/lib/upstashRateLimit";
import { emailVerificationLink } from "@/lib/email";
import crypto from "crypto";

export async function memberLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    // Basic rate limiting: per IP and per email
    const hdrs = await headers();
    const ipHeader = hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "unknown";
    const ip = ipHeader.split(",")[0].trim() || "unknown";

    const WINDOW = "15 m"; // 15 minutes
    const LIMIT = 5; // max 5 attempts per window

    // Prefer distributed limiter; fallback to in-memory if not configured
    const ipUp = await checkUpstashLimit({ key: `login:${ip}`, limit: LIMIT, window: WINDOW });
    const emailUp = await checkUpstashLimit({ key: `login-email:${email}`, limit: LIMIT, window: WINDOW });

    if (!ipUp.allowed || !emailUp.allowed) {
      throw new Error("Too many login attempts. Please wait a few minutes.");
    }

    if (ipUp.usedFallback || emailUp.usedFallback) {
      const WINDOW_MS = 15 * 60 * 1000;
      const ipLocal = checkRateLimit({ key: `login:${ip}`, limit: LIMIT, windowMs: WINDOW_MS });
      const emailLocal = checkRateLimit({ key: `login-email:${email}`, limit: LIMIT, windowMs: WINDOW_MS });
      if (!ipLocal.allowed || !emailLocal.allowed) {
        throw new Error("Too many login attempts. Please wait a few minutes.");
      }
    }
    // Find member by email
    const member = await prisma.profile.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        emailVerified: true,
        userRoles: true, 
        displayName: true,
        passwordHash: true 
      },
    });

    if (!member) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, member.passwordHash);
    
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Create a server-side session and set session cookie
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await prisma.session.create({
      data: { profileId: member.id, expiresAt },
      select: { id: true },
    });

    const cookieStore = await cookies();
    // Clear old cookie if present
    cookieStore.delete("member_email");
    cookieStore.set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    redirect("/member");
  } catch (error) {
    console.error("Member login error:", error);
    throw error;
  }
}

export async function memberLogout() {
  const cookieStore = await cookies();
  const sid = cookieStore.get("session_id")?.value;
  if (sid) {
    try {
      await prisma.session.delete({ where: { id: sid } });
    } catch {}
    cookieStore.delete("session_id");
  }
  // Also remove legacy cookie
  cookieStore.delete("member_email");
  redirect("/member");
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  const sid = cookieStore.get("session_id")?.value;

  if (!sid) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { id: sid },
      select: {
        id: true,
        expiresAt: true,
        profile: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            displayName: true,
            userRoles: true,
            status: true,
          },
        },
      },
    });

    if (!session) return null;
    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      // Expired: clean up and return null
      try { await prisma.session.delete({ where: { id: sid } }); } catch {}
      cookieStore.delete("session_id");
      return null;
    }

    return session.profile;
  } catch (error) {
    console.error("Get member session error:", error);
    return null;
  }
}

export async function resendVerificationEmail() {
  const member = await getMemberSession();
  
  if (!member) {
    throw new Error("You must be signed in to resend verification email");
  }

  if (member.emailVerified) {
    throw new Error("Your email is already verified");
  }

  // Rate limit
  const hdrs = await headers();
  const ipHeader = hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "unknown";
  const ip = ipHeader.split(",")[0].trim() || "unknown";
  const limit = await checkUpstashLimit({ key: `resend-verify:${member.id}`, limit: 3, window: "1 h" });
  
  if (!limit.allowed) {
    throw new Error("Too many requests. Please wait before requesting another verification email.");
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.profile.update({
    where: { id: member.id },
    data: {
      verificationToken,
      verificationTokenExpiry,
    },
  });

  await emailVerificationLink({
    to: member.email,
    applicantName: member.displayName,
    token: verificationToken,
  });

  redirect("/member");
}
