"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/app/member/actions";
import { emailFinalApproved, emailFinalRejected } from "@/lib/email";

async function requireAdmin() {
  const member = await getMemberSession();
  if (!member || !member.userRoles.includes("ADMIN")) {
    throw new Error("Unauthorized");
  }
}

const ALLOWED_ROLES = ["MEMBER", "REVIEWER", "APPROVER", "ADMIN"] as const;

export async function updateUserRoles(formData: FormData) {
  await requireAdmin();

  const profileId = (formData.get("profileId") as string)?.trim();
  if (!profileId) {
    throw new Error("Missing profile id");
  }

  const submittedRoles = formData.getAll("roles").map((r) => String(r));
  const nextRoles = Array.from(
    new Set(
      submittedRoles.filter((r) => ALLOWED_ROLES.includes(r as (typeof ALLOWED_ROLES)[number]))
    )
  );

  // Always ensure MEMBER is present so the account retains baseline access
  if (!nextRoles.includes("MEMBER")) {
    nextRoles.unshift("MEMBER");
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { userRoles: nextRoles as any },
  });

  revalidatePath("/admin");
}

export async function approveProfile(id: string, note?: string) {
  await requireAdmin();
  const updated = await prisma.profile.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewerNote: note?.slice(0, 500) || null,
    },
    select: { displayName: true, submissionRole: true, email: true },
  });

  await emailFinalApproved({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    applicantEmail: updated.email,
  });
  
  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath("/");
}

export async function rejectProfile(id: string, note?: string) {
  await requireAdmin();
  const updated = await prisma.profile.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewerNote: note?.slice(0, 500) || null,
    },
    select: { displayName: true, submissionRole: true, email: true },
  });

  await emailFinalRejected({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    applicantEmail: updated.email,
  });
  
  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath("/");
}
