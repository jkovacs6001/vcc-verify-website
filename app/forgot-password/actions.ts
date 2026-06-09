"use server";

import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { appUrl, emailPasswordReset } from "@/lib/email";
import { checkUpstashLimit } from "@/lib/upstashRateLimit";

export type ForgotPasswordState =
  | { ok: false; error: string }
  | { ok: true };

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { ok: false, error: "Email is required" };

  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "unknown").split(",")[0].trim();

  try {
    const ipLimit = await checkUpstashLimit({ key: `pwd-reset:${ip}`, limit: 5, window: "1 h" });
    const emailLimit = await checkUpstashLimit({ key: `pwd-reset-email:${email}`, limit: 3, window: "1 h" });
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return { ok: false, error: "Too many attempts. Please wait a while." };
    }
  } catch {
    // rate limiter unavailable — proceed
  }

  const profile = await prisma.profile.findUnique({
    where: { email },
    select: { id: true, displayName: true },
  });

  // Always return success to avoid revealing whether the email exists
  if (profile) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.profile.update({
      where: { id: profile.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
    });

    await emailPasswordReset({
      to: email,
      displayName: profile.displayName,
      resetUrl: appUrl(`/reset-password/${token}`),
    });
  }

  return { ok: true };
}
