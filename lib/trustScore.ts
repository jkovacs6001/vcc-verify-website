import { prisma } from "./db";

export async function computeTrustScore(profileId: string): Promise<number> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: { references: true },
  });

  if (!profile || profile.status !== "APPROVED") return 0;

  let score = 0;

  // Base: approved member
  score += 20;

  // References (up to 30 pts, 10 per reference, max 3)
  score += Math.min(profile.references.length * 10, 30);

  // Profile completeness (up to 20 pts)
  if (profile.bio) score += 5;
  if (profile.wallet) score += 5;
  if (profile.website || profile.github || profile.linkedin) score += 5;
  if (profile.telegram || profile.xHandle) score += 5;

  // Skills and tags (up to 10 pts)
  if (profile.skills.length >= 3) score += 5;
  if (profile.tags.length >= 2) score += 5;

  // Location listed (5 pts)
  if (profile.location) score += 5;

  // Account age bonus (up to 15 pts)
  const ageMs = Date.now() - new Date(profile.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays >= 90) score += 15;
  else if (ageDays >= 30) score += 8;
  else if (ageDays >= 7) score += 3;

  return Math.min(score, 100);
}

export async function refreshTrustScore(profileId: string, adminId?: string): Promise<number> {
  const newScore = await computeTrustScore(profileId);

  const current = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { trustScore: true },
  });

  if (!current) return newScore;

  const delta = newScore - current.trustScore;

  await prisma.profile.update({
    where: { id: profileId },
    data: { trustScore: newScore },
  });

  if (delta !== 0) {
    await prisma.trustScoreAudit.create({
      data: {
        profileId,
        delta,
        reason: adminId ? "Manual admin adjustment" : "Automatic recalculation",
        adminId: adminId ?? null,
      },
    });
  }

  return newScore;
}
