import { headers } from "next/headers";
import { prisma } from "@/lib/db";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  text: string;
};

type EmailResult = { ok: true } | { ok: false; reason: string };

function normalizeList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(",");
  return items
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

function appBaseUrl(): string {
  const envUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const fallback = "http://localhost:3000";
  const url = (envUrl || fallback).trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function appUrl(path: string): string {
  return `${appBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function emailVerificationLink(params: {
  to: string;
  applicantName: string;
  token: string;
}): Promise<void> {
  const verificationUrl = appUrl(`/verify-email/${params.token}`);
  
  await sendEmail({
    to: params.to,
    subject: "Verify your email address",
    text: [
      `Hi ${params.applicantName},`,
      "",
      "Thanks for creating an account. Please verify your email address by clicking the link below:",
      "",
      verificationUrl,
      "",
      "This link will expire in 24 hours.",
      "",
      "If you didn't create this account, you can safely ignore this email.",
      "",
      "– VCC Verification Team",
    ].join("\n"),
  });
}

async function sendEmail({ to, subject, text }: SendEmailParams): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "VCC <no-reply@example.com>";
  const recipients = normalizeList(to);

  if (!apiKey) {
    console.warn("Email skipped: RESEND_API_KEY not set");
    return { ok: false, reason: "missing-api-key" };
  }

  if (recipients.length === 0) {
    console.warn("Email skipped: no recipients provided", { subject });
    return { ok: false, reason: "no-recipients" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: recipients, subject, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Email send failed", { status: res.status, body });
    return { ok: false, reason: `resend-${res.status}` };
  }

  return { ok: true };
}

async function reviewerRecipients(): Promise<string[]> {
  const reviewers = await prisma.profile.findMany({
    where: {
      userRoles: { has: "REVIEWER" },
    },
    select: { email: true },
  });
  return reviewers.map((r) => r.email);
}

async function approverRecipients(): Promise<string[]> {
  const approvers = await prisma.profile.findMany({
    where: {
      userRoles: { has: "APPROVER" },
    },
    select: { email: true },
  });
  return approvers.map((a) => a.email);
}

export async function emailApplicationSubmittedToReviewers(params: {
  applicantName: string;
  applicantRole: string;
  profileId: string;
}): Promise<void> {
  const to = await reviewerRecipients();
  console.log(`[EMAIL] Attempting to send application notification to ${to.length} reviewers:`, to);
  const result = await sendEmail({
    to,
    subject: `New application: ${params.applicantName} (${params.applicantRole})`,
    text: [
      `A new application was submitted by ${params.applicantName} (${params.applicantRole}).`,
      `Review queue: ${appUrl("/review")}`,
      `Profile: ${appUrl(`/directory/${params.profileId}`)}`,
      "",
      "Please review and move to approval or reject as appropriate.",
    ].join("\n"),
  });
  if (!result.ok) {
    console.error(`[EMAIL] Failed to send to reviewers. Reason: ${result.reason}`);
  } else {
    console.log("[EMAIL] Successfully sent to reviewers");
  }
}

export async function emailApplicationSubmittedToApplicant(params: {
  to: string;
  applicantName: string;
  applicantRole: string;
}): Promise<void> {
  console.log(`[EMAIL] Attempting to send confirmation to applicant: ${params.to}`);
  const result = await sendEmail({
    to: params.to,
    subject: "We've received your application",
    text: [
      `Hi ${params.applicantName},`,
      "",
      `Thanks for applying as ${params.applicantRole}. Our reviewers will take a look and you'll get an update soon.`,
      "",
      "You can sign in anytime to check your status.",
      `${appUrl("/member")}`,
      "",
      "– VCC Verification Team",
    ].join("\n"),
  });
  if (!result.ok) {
    console.error(`[EMAIL] Failed to send to applicant. Reason: ${result.reason}`);
  } else {
    console.log("[EMAIL] Successfully sent to applicant");
  }
}

export async function emailReviewApproved(params: {
  applicantName: string;
  applicantRole: string;
  profileId: string;
  applicantEmail: string;
}): Promise<void> {
  const toApprovers = await approverRecipients();
  await sendEmail({
    to: toApprovers,
    subject: `Ready for approval: ${params.applicantName} (${params.applicantRole})`,
    text: [
      `${params.applicantName} (${params.applicantRole}) was cleared by review and is ready for approval.`,
      `Approval queue: ${appUrl("/approve")}`,
      `Profile: ${appUrl(`/directory/${params.profileId}`)}`,
    ].join("\n"),
  });

  await sendEmail({
    to: params.applicantEmail,
    subject: "Your application advanced to approval",
    text: [
      `Hi ${params.applicantName},`,
      "",
      "Good news — your application passed the initial review and is now in the final approval stage.",
      "We'll let you know once the final decision is made.",
      "",
      "You can check your status here:",
      `${appUrl("/member")}`,
      "",
      "– VCC Verification Team",
    ].join("\n"),
  });
}

export async function emailReviewRejected(params: {
  applicantName: string;
  applicantRole: string;
  applicantEmail: string;
}): Promise<void> {
  await sendEmail({
    to: params.applicantEmail,
    subject: "Update on your application",
    text: [
      `Hi ${params.applicantName},`,
      "",
      "Thanks for applying. After review, we aren't able to move forward right now.",
      "Feel free to strengthen your profile and re-apply later — we appreciate your interest.",
      "",
      "– VCC Verification Team",
    ].join("\n"),
  });
}

export async function emailFinalApproved(params: {
  applicantName: string;
  applicantRole: string;
  applicantEmail: string;
}): Promise<void> {
  await sendEmail({
    to: params.applicantEmail,
    subject: "You're approved!",
    text: [
      `Hi ${params.applicantName},`,
      "",
      `Congratulations — your application for ${params.applicantRole} has been approved!`,
      "Your profile is now verified.",
      "",
      "View your profile:",
      `${appUrl("/member")}`,
      "",
      "– VCC Verification Team",
    ].join("\n"),
  });
}

export async function emailFinalRejected(params: {
  applicantName: string;
  applicantRole: string;
  applicantEmail: string;
}): Promise<void> {
  await sendEmail({
    to: params.applicantEmail,
    subject: "Update on your application",
    text: [
      `Hi ${params.applicantName},`,
      "",
      "Thank you for applying. After final review we aren't able to approve this time.",
      "We encourage you to re-apply in the future with new work or references.",
      "",
      "– VCC Verification Team",
    ].join("\n"),
  });
}
