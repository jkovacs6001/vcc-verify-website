"use server";

import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";

export async function submitScamReport(formData: FormData) {
  const hdrs = await headers();
  const ipHeader = hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "unknown";
  const ip = ipHeader.split(",")[0].trim();

  const rl = checkRateLimit({ key: `scam-report:${ip}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    throw new Error("Too many reports submitted. Please wait before trying again.");
  }

  const walletAddress = (formData.get("walletAddress") as string)?.trim();
  const chain = (formData.get("chain") as string)?.trim() || "solana";
  const projectName = (formData.get("projectName") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim();
  const evidenceRaw = (formData.get("evidenceLinks") as string)?.trim();

  if (!walletAddress) throw new Error("Wallet address is required.");
  if (!description || description.length < 20)
    throw new Error("Please provide a description of at least 20 characters.");

  const evidenceLinks = evidenceRaw
    ? evidenceRaw.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  await prisma.scamReport.create({
    data: {
      walletAddress,
      chain,
      projectName,
      description,
      evidenceLinks,
      reporterIp: ip,
    },
  });
}

export async function getScamReports() {
  return prisma.scamReport.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateScamReportStatus(
  id: string,
  status: "REVIEWED" | "CONFIRMED" | "DISMISSED",
  adminNote?: string
) {
  return prisma.scamReport.update({
    where: { id },
    data: { status, adminNote: adminNote ?? null, reviewedAt: new Date() },
  });
}
