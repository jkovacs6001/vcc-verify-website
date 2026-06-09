"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export type ResetPasswordState =
  | { ok: false; error: string }
  | { ok: true };

export async function resetPassword(
  token: string,
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match" };
  }

  const profile = await prisma.profile.findUnique({
    where: { passwordResetToken: token },
    select: { id: true, passwordResetExpiresAt: true },
  });

  if (!profile) {
    return { ok: false, error: "This reset link is invalid or has already been used." };
  }

  if (!profile.passwordResetExpiresAt || profile.passwordResetExpiresAt < new Date()) {
    return { ok: false, error: "This reset link has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return { ok: true };
}
