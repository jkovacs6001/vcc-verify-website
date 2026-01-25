"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/app/member/actions";
import { emailReviewApproved, emailReviewRejected } from "@/lib/email";

async function requireReviewer() {
  const member = await getMemberSession();
  const allowed = member && (member.userRoles.includes("REVIEWER") || member.userRoles.includes("APPROVER") || member.userRoles.includes("ADMIN"));
  if (!allowed) throw new Error("Unauthorized");
  return member;
}

export async function addComment(profileId: string, content: string) {
  const member = await requireReviewer();
  
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

export async function markReadyForApproval(id: string, note?: string) {
  await requireReviewer();

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      status: "READY_FOR_APPROVAL",
      reviewerNote: note?.slice(0, 500) || null,
      reviewedAt: new Date(),
    },
    select: { id: true, displayName: true, submissionRole: true, email: true },
  });

  await emailReviewApproved({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    profileId: updated.id,
    applicantEmail: updated.email,
  });

  revalidatePath("/review");
  revalidatePath("/approve");
  revalidatePath("/admin");
  revalidatePath("/member");
}

export async function rejectAfterReview(id: string, note?: string) {
  await requireReviewer();

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewerNote: note?.slice(0, 500) || null,
      reviewedAt: new Date(),
    },
    select: { displayName: true, submissionRole: true, email: true },
  });

  await emailReviewRejected({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    applicantEmail: updated.email,
  });

  revalidatePath("/review");
  revalidatePath("/admin");
  revalidatePath("/member");
}
