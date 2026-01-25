"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/app/member/actions";
import { emailFinalApproved, emailFinalRejected } from "@/lib/email";

async function requireApprover() {
  const member = await getMemberSession();
  const allowed = member && (member.userRoles.includes("APPROVER") || member.userRoles.includes("ADMIN"));
  if (!allowed) throw new Error("Unauthorized");
  return member;
}

export async function addComment(profileId: string, content: string) {
  const member = await requireApprover();
  
  const trimmed = content.trim().slice(0, 1000);
  if (!trimmed) throw new Error("Comment cannot be empty");

  await prisma.comment.create({
    data: {
      profileId,
      authorId: member.id,
      content: trimmed,
    },
  });

  revalidatePath("/review");
  revalidatePath("/approve");
  revalidatePath("/admin");
}

export async function approveApplication(id: string, note?: string) {
  await requireApprover();

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewerNote: note?.slice(0, 500) || null,
      reviewedAt: new Date(),
    },
    select: { displayName: true, submissionRole: true, email: true },
  });

  await emailFinalApproved({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    applicantEmail: updated.email,
  });

  revalidatePath("/approve");
  revalidatePath("/admin");
  revalidatePath("/member");
  revalidatePath("/directory");
  revalidatePath("/");
}

export async function rejectApplication(id: string, note?: string) {
  await requireApprover();

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewerNote: note?.slice(0, 500) || null,
      reviewedAt: new Date(),
    },
    select: { displayName: true, submissionRole: true, email: true },
  });

  await emailFinalRejected({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    applicantEmail: updated.email,
  });

  revalidatePath("/approve");
  revalidatePath("/admin");
  revalidatePath("/member");
}
