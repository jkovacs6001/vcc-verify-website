"use server";

import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { getMemberSession } from "@/app/member/actions";
import { revalidatePath } from "next/cache";

export async function submitProjectApplication(formData: FormData) {
  const hdrs = await headers();
  const ipHeader = hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "unknown";
  const ip = ipHeader.split(",")[0].trim();

  const rl = checkRateLimit({ key: `project-apply:${ip}`, limit: 3, windowMs: 24 * 60 * 60 * 1000 });
  if (!rl.allowed) throw new Error("Too many applications submitted today. Please try again tomorrow.");

  const name = (formData.get("name") as string)?.trim();
  const website = (formData.get("website") as string)?.trim() || null;
  const contractAddress = (formData.get("contractAddress") as string)?.trim() || null;
  const chain = (formData.get("chain") as string)?.trim() || "solana";
  const description = (formData.get("description") as string)?.trim();
  const teamContact = (formData.get("teamContact") as string)?.trim();
  const twitterHandle = (formData.get("twitterHandle") as string)?.trim() || null;
  const telegramHandle = (formData.get("telegramHandle") as string)?.trim() || null;
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || null;

  if (!name) throw new Error("Project name is required.");
  if (!description || description.length < 30) throw new Error("Please provide a description of at least 30 characters.");
  if (!teamContact) throw new Error("Team contact is required.");

  await prisma.project.create({
    data: { name, website, contractAddress, chain, description, teamContact, twitterHandle, telegramHandle, githubUrl },
  });
}

export async function reviewProject(id: string, status: "APPROVED" | "REJECTED", adminNote?: string) {
  const member = await getMemberSession();
  if (!member || !member.userRoles.includes("ADMIN")) throw new Error("Unauthorized");

  await prisma.project.update({
    where: { id },
    data: { status, adminNote: adminNote ?? null, reviewedAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/projects");
}
