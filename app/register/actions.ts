"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export type RegisterState =
  | { ok: false; error: string }
  | { ok: true };

export async function registerAccount(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const displayName = (formData.get("displayName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!displayName || !email || !password) {
    return { ok: false, error: "All fields are required" };
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Invalid email address" };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  try {
    // Check if email already exists
    const existing = await prisma.profile.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: "An account with this email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create account-only profile (no verification application)
    await prisma.profile.create({
      data: {
        displayName,
        email,
        passwordHash,
        userRole: "MEMBER",
        // Application fields are null - this is just an account
        submissionRole: null,
        status: null,
        skills: [],
        tags: [],
      },
    });

    // Auto-login after registration
    const cookieStore = await cookies();
    cookieStore.set("member_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  } catch (error) {
    console.error("Registration error:", error);
    return { ok: false, error: "Failed to create account. Please try again." };
  }

  // Redirect outside try-catch so it doesn't get caught
  redirect("/member");
}
