"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/app/member/actions";
import { emailFinalApproved, emailFinalRejected } from "@/lib/email";
import { refreshTrustScore } from "@/lib/trustScore";

export async function reviewScamReport(
  id: string,
  status: "REVIEWED" | "CONFIRMED" | "DISMISSED",
  adminNote?: string
) {
  const member = await getMemberSession();
  if (!member || !member.userRoles.includes("ADMIN")) throw new Error("Unauthorized");

  await prisma.scamReport.update({
    where: { id },
    data: { status, adminNote: adminNote ?? null, reviewedAt: new Date() },
  });

  revalidatePath("/admin");
}

export async function editScamReport(
  id: string,
  fields: {
    description: string;
    projectName: string | null;
    address: string;
    chain: string;
    evidenceLinks: string[];
  }
) {
  const member = await getMemberSession();
  if (!member || !member.userRoles.includes("ADMIN")) throw new Error("Unauthorized");

  const report = await prisma.scamReport.findUnique({ where: { id }, select: { reportType: true } });
  if (!report) throw new Error("Report not found");

  const update: Record<string, unknown> = {
    description: fields.description.slice(0, 2000),
    projectName: fields.projectName?.slice(0, 200) || null,
    evidenceLinks: fields.evidenceLinks.slice(0, 10),
  };

  if (report.reportType === "wallet") {
    update.walletAddress = fields.address;
    update.chain = fields.chain;
  } else if (report.reportType === "project") {
    update.contractAddress = fields.address;
    update.chain = fields.chain;
  } else if (report.reportType === "twitter") {
    update.twitterHandle = fields.address.replace(/^@/, "");
  }

  await prisma.scamReport.update({ where: { id }, data: update });
  revalidatePath("/admin");
}

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

  await refreshTrustScore(id);

  await emailFinalApproved({
    applicantName: updated.displayName,
    applicantRole: updated.submissionRole ?? "Applicant",
    applicantEmail: updated.email,
  });

  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath("/");
}

export async function deleteUser(profileId: string) {
  await requireAdmin();

  if (!profileId) {
    throw new Error("Missing profile id");
  }

  // Delete the user and all related data (comments, references will cascade if configured)
  await prisma.profile.delete({
    where: { id: profileId },
  });

  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath("/");
}

export async function reviewProject(
  id: string,
  status: "APPROVED" | "REJECTED",
  adminNote?: string
) {
  await requireAdmin();
  await prisma.project.update({
    where: { id },
    data: { status, adminNote: adminNote ?? null, reviewedAt: new Date() },
  });
  revalidatePath("/admin");
  revalidatePath("/projects");
}

export async function adjustTrustScore(profileId: string, delta: number, reason: string) {
  const member = await getMemberSession();
  if (!member || !member.userRoles.includes("ADMIN")) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { trustScore: true } });
  if (!profile) throw new Error("Profile not found");

  const newScore = Math.min(100, Math.max(0, profile.trustScore + delta));
  const actualDelta = newScore - profile.trustScore;

  await prisma.profile.update({ where: { id: profileId }, data: { trustScore: newScore } });
  if (actualDelta !== 0) {
    await prisma.trustScoreAudit.create({
      data: { profileId, delta: actualDelta, reason, adminId: member.id },
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/directory/${profileId}`);
}

export async function editBlacklistedWallet(
  id: string,
  fields: { walletAddress: string; chain: string; reason: string }
) {
  await requireAdmin();
  await prisma.blacklistedWallet.update({
    where: { id },
    data: {
      walletAddress: fields.walletAddress.trim().slice(0, 255),
      chain: fields.chain.trim().slice(0, 32),
      reason: fields.reason.trim().slice(0, 1000),
    },
  });
  revalidatePath("/admin");
  revalidatePath("/blacklist");
}

export async function deleteBlacklistedWallet(id: string) {
  await requireAdmin();
  await prisma.blacklistedWallet.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/blacklist");
}

export async function removeConfirmedReport(id: string) {
  await requireAdmin();
  await prisma.scamReport.update({
    where: { id },
    data: { status: "DISMISSED" },
  });
  revalidatePath("/admin");
  revalidatePath("/blacklist");
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
