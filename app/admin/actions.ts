"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/app/member/actions";

async function requireAdmin() {
  const member = await getMemberSession();
  if (!member || !member.userRoles.includes("ADMIN")) {
    throw new Error("Unauthorized");
  }
}

export async function approveProfile(id: string, note?: string) {
  await requireAdmin();
  await prisma.profile.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewerNote: note?.slice(0, 500) || null,
    },
  });
  
  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath("/");
}

export async function rejectProfile(id: string, note?: string) {
  await requireAdmin();
  await prisma.profile.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewerNote: note?.slice(0, 500) || null,
    },
  });
  
  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath("/");
}
