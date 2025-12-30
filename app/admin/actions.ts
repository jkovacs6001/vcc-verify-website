"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    throw new Error("Unauthorized");
  }
}

export async function adminLogin(formData: FormData) {
  const token = (formData.get("token") as string | null)?.trim() ?? "";
  if (token && token === process.env.ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return;
  }
  throw new Error("Invalid token");
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
}
