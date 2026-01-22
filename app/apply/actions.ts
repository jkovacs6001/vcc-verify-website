"use server";

import { prisma } from "@/lib/db";

function s(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function opt(formData: FormData, key: string): string | null {
  const v = s(formData, key);
  return v ? v : null;
}

function splitCsv(v: string, max = 20): string[] {
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, max);
}

function clampLen(v: string | null, max: number): string | null {
  if (!v) return null;
  const t = v.trim();
  return t.length > max ? t.slice(0, max) : t;
}

type ApplyState =
  | { ok: false; error: string }
  | { ok: true; id: string };

export async function submitApplication(_: any, formData: FormData): Promise<ApplyState> {
  // Honeypot (spam trap)
  if (s(formData, "company")) return { ok: true, id: "ok" };

  const displayName = s(formData, "displayName");
  const role = s(formData, "role");
  const email = s(formData, "email");
  // wallet is optional now
  const wallet = opt(formData, "wallet");

  if (!displayName || !role || !email) {
    return { ok: false, error: "Missing required fields." };
  }

  const handle = clampLen(opt(formData, "handle"), 40);
  const location = clampLen(opt(formData, "location"), 80);
  const bio = clampLen(opt(formData, "bio"), 800);

  const telegram = clampLen(opt(formData, "telegram"), 80);
  const xHandle = clampLen(opt(formData, "xHandle"), 80);
  const website = clampLen(opt(formData, "website"), 200);
  const github = clampLen(opt(formData, "github"), 200);
  const linkedin = clampLen(opt(formData, "linkedin"), 200);

  const chain = clampLen(opt(formData, "chain"), 24) ?? "solana";

  const skills = splitCsv(s(formData, "skillsCsv"), 30);
  const tags = splitCsv(s(formData, "tagsCsv"), 30);

  // Up to 3 references for MVP (easy to extend)
  const refs = [0, 1, 2]
    .map((i) => {
      const name = s(formData, `ref_${i}_name`);
      if (!name) return null;
      return {
        name: clampLen(name, 80) ?? name,
        relationship: clampLen(opt(formData, `ref_${i}_relationship`), 120),
        contact: clampLen(opt(formData, `ref_${i}_contact`), 200),
        link: clampLen(opt(formData, `ref_${i}_link`), 300),
        notes: clampLen(opt(formData, `ref_${i}_notes`), 400),
      };
    })
    .filter(Boolean) as Array<{
      name: string;
      relationship: string | null;
      contact: string | null;
      link: string | null;
      notes: string | null;
    }>;

  // clamp wallet length if present, otherwise null
  const walletVal = clampLen(wallet, 200); // string | null

  const created = await prisma.profile.create({
    data: {
      displayName,
      handle,
      role,
      location,
      bio,
      skills,
      tags,
      email,
      telegram,
      xHandle,
      website,
      github,
      linkedin,
      chain,
      wallet: walletVal, // nullable in DB now
      status: "PENDING",
      references: refs.length ? { create: refs } : undefined,
    },
    select: { id: true },
  });

  return { ok: true, id: created.id };
}
