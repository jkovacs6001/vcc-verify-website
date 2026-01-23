"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function memberLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  try {
    // Find member by email
    const member = await prisma.profile.findUnique({
      where: { email },
      select: { id: true, email: true, userRole: true, displayName: true },
    });

    if (!member) {
      throw new Error("No profile found with this email");
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set("member_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    redirect("/member");
  } catch (error) {
    console.error("Member login error:", error);
    throw error;
  }
}

export async function memberLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("member_email");
  redirect("/member");
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  const email = cookieStore.get("member_email")?.value;

  if (!email) {
    return null;
  }

  try {
    const member = await prisma.profile.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        userRole: true,
        status: true,
      },
    });

    return member;
  } catch (error) {
    console.error("Get member session error:", error);
    return null;
  }
}
