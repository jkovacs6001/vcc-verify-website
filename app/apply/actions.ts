"use server";

import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { checkUpstashLimit } from "@/lib/upstashRateLimit";
import {
  emailApplicationSubmittedToApplicant,
  emailApplicationSubmittedToReviewers,
  emailVerificationLink,
} from "@/lib/email";
import crypto from "crypto";

function s(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function opt(formData: FormData, key: string): string | null {
  const v = s(formData, key);
  return v ? v : null;
}

function splitCsv(v: string, max = 20): string[] {
  if (!v || v.length > 1000) return [];
  return v
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0 && x.length <= 100)
    .slice(0, max);
}

function clampLen(v: string | null, max: number): string | null {
  if (!v) return null;
  const t = v.trim();
  return t.length > max ? t.slice(0, max) : t;
}

function isValidUrl(url: string | null): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export type ApplyState =
  | { ok: false; error: string }
  | { ok: true; id: string };

export async function submitApplication(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  try {
    // Honeypot (spam trap)
    if (s(formData, "company")) return { ok: true, id: "ok" };

    const displayName = s(formData, "displayName");
    const submissionRole = s(formData, "role");
    const email = s(formData, "email");
    const password = s(formData, "password");
    const confirmPassword = s(formData, "confirmPassword");

    if (!displayName || !submissionRole || !email || !password || !confirmPassword) {
      return { ok: false, error: "Missing required fields." };
    }

    if (password !== confirmPassword) {
      return { ok: false, error: "Passwords do not match." };
    }

    // Rate limit per IP and per email
    const hdrs = await headers();
    const ipHeader = hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "unknown";
    const ip = ipHeader.split(",")[0].trim() || "unknown";
    const ipLimit = await checkUpstashLimit({ key: `apply:${ip}`, limit: 3, window: "24 h" });
    const emailLimit = await checkUpstashLimit({ key: `apply-email:${email}`, limit: 3, window: "24 h" });
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return { ok: false, error: "Too many application attempts. Please try again later." };
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      return { ok: false, error: "Invalid email address" };
    }

    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const wallet = clampLen(opt(formData, "wallet"), 255);

    const handle = clampLen(opt(formData, "handle"), 40);
    const location = clampLen(opt(formData, "location"), 80);
    const bio = clampLen(opt(formData, "bio"), 800);

    const telegram = clampLen(opt(formData, "telegram"), 80);
    const xHandle = clampLen(opt(formData, "xHandle"), 80);
    const website = clampLen(opt(formData, "website"), 200);
    const github = clampLen(opt(formData, "github"), 200);
    const linkedin = clampLen(opt(formData, "linkedin"), 200);

    const chain = clampLen(opt(formData, "chain"), 24) ?? "solana";

    const skills = splitCsv(s(formData, "skillsCsv"), 30);
    const tags = splitCsv(s(formData, "tagsCsv"), 30);

    // Up to 3 references for MVP (easy to extend)
    const refs = [0, 1, 2]
      .map((i) => {
        const name = s(formData, `ref_${i}_name`);
        if (!name) return null;
        return {
          name: clampLen(name, 80) ?? name,
          relationship: clampLen(opt(formData, `ref_${i}_relationship`), 120),
          contact: clampLen(opt(formData, `ref_${i}_contact`), 200),
          link: clampLen(opt(formData, `ref_${i}_link`), 300),
          notes: clampLen(opt(formData, `ref_${i}_notes`), 400),
        };
      })
      .filter(Boolean) as Array<{
        name: string;
        relationship: string | null;
        contact: string | null;
        link: string | null;
        notes: string | null;
      }>;

    if (website && !isValidUrl(website)) {
      return { ok: false, error: "Invalid website URL" };
    }

    // Check if email already exists
    const existing = await prisma.profile.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (existing) {
      // If they already have a verification application pending/approved
      if (existing.status !== null) {
        return { ok: false, error: "You have already applied for verification with this email" };
      }

      // They have an account but no application - update their profile with application data
      const updated = await prisma.profile.update({
        where: { id: existing.id },
        data: {
          displayName,
          handle,
          submissionRole,
          location,
          bio,
          skills,
          tags,
          telegram,
          xHandle,
          website,
          github,
          linkedin,
          chain,
          wallet,
          status: "PENDING", // Now applying for verification
          references: refs.length ? { create: refs } : undefined,
        },
        select: { id: true },
      });

      await Promise.all([
        emailApplicationSubmittedToReviewers({
          applicantName: displayName,
          applicantRole: submissionRole,
          profileId: updated.id,
        }),
        emailApplicationSubmittedToApplicant({
          to: email,
          applicantName: displayName,
          applicantRole: submissionRole,
        }),
      ]);

      return { ok: true, id: updated.id };
    }

    // New user - create profile with application
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const created = await prisma.profile.create({
      data: {
        displayName,
        handle,
        submissionRole,
        location,
        bio,
        skills,
        tags,
        email,
        passwordHash,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
        telegram,
        xHandle,
        website,
        github,
        linkedin,
        chain,
        wallet,
        status: "PENDING",
        references: refs.length ? { create: refs } : undefined,
      },
      select: { id: true },
    });

    await Promise.all([
      // Email verification temporarily disabled - coming soon
      // emailVerificationLink({
      //   to: email,
      //   applicantName: displayName,
      //   token: verificationToken,
      // }),
      emailApplicationSubmittedToReviewers({
        applicantName: displayName,
        applicantRole: submissionRole,
        profileId: created.id,
      }),
      emailApplicationSubmittedToApplicant({
        to: email,
        applicantName: displayName,
        applicantRole: submissionRole,
      }),
    ]);

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("Application submission error:", error);
    return { ok: false, error: "Failed to submit application. Please try again." };
  }
}
