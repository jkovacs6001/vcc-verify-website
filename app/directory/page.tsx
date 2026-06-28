import Link from "next/link";
import { prisma } from "@/lib/db";
import { Suspense } from "react";
import { DirectoryFilters } from "@/components/DirectoryFilters";
import { getBadgeFromScore } from "@/lib/badge";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ location?: string; role?: string; badge?: string; skill?: string | string[]; q?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const filterLocation = sp.location ?? null;
  const filterRole = sp.role ?? null;
  const filterBadge = sp.badge ?? null;
  const filterSkills = sp.skill ? (Array.isArray(sp.skill) ? sp.skill : [sp.skill]) : [];
  const filterQuery = sp.q?.trim() ?? null;

  // Build WHERE clause
  const where: Record<string, unknown> = { status: "APPROVED" };
  if (filterLocation) where.location = { contains: filterLocation, mode: "insensitive" };
  if (filterRole) where.submissionRole = { contains: filterRole, mode: "insensitive" };
  if (filterSkills.length > 0) where.skills = { hasSome: filterSkills };
  if (filterBadge === "ELITE") where.trustScore = { gte: 85 };
  else if (filterBadge === "TRUSTED") where.trustScore = { gte: 50, lt: 85 };
  else if (filterBadge === "BASIC") where.trustScore = { gt: 0, lt: 50 };
  if (filterQuery) {
    where.OR = [
      { displayName: { contains: filterQuery, mode: "insensitive" } },
      { handle: { contains: filterQuery, mode: "insensitive" } },
      { submissionRole: { contains: filterQuery, mode: "insensitive" } },
      { bio: { contains: filterQuery, mode: "insensitive" } },
      { location: { contains: filterQuery, mode: "insensitive" } },
    ];
  }

  const [profiles, allApproved] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: [{ trustScore: "desc" }, { createdAt: "desc" }],
      take: 60,
      select: {
        id: true,
        displayName: true,
        handle: true,
        submissionRole: true,
        location: true,
        tags: true,
        skills: true,
        trustScore: true,
        badgeLevel: true,
      },
    }),
    prisma.profile.findMany({
      where: { status: "APPROVED" },
      select: { location: true, submissionRole: true, skills: true },
    }),
  ]);

  // Derive filter options from all approved profiles
  const allLocations = [...new Set(allApproved.map((p) => p.location).filter(Boolean) as string[])].sort();
  const allRoles = [...new Set(allApproved.map((p) => p.submissionRole).filter(Boolean) as string[])].sort();
  const allSkills = [...new Set(allApproved.flatMap((p) => p.skills))].sort();

  const activeCount = [filterLocation, filterRole, filterBadge, filterQuery, ...filterSkills].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Directory</h1>

      <Suspense>
        <DirectoryFilters
          allLocations={allLocations}
          allRoles={allRoles}
          allSkills={allSkills}
          activeCount={activeCount}
          query={filterQuery ?? ""}
        />
      </Suspense>

      {activeCount > 0 && (
        <div className="text-sm text-blistTextMuted">
          {profiles.length} result{profiles.length !== 1 ? "s" : ""} for active filters
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-blistBorder bg-black/40 p-6 text-blistTextMuted">
          {activeCount > 0 ? "No members match your filters." : "No approved profiles yet."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => {
            const badge = (p.badgeLevel as "BASIC" | "TRUSTED" | "ELITE" | null) ??
              getBadgeFromScore(p.trustScore, true);
            return (
              <Link
                key={p.id}
                href={`/directory/${p.id}`}
                className="rounded-2xl border border-blistBorder bg-black/40 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {p.displayName}
                      {p.handle ? <span className="text-blistTextMuted text-sm"> · @{p.handle}</span> : null}
                    </div>
                    <div className="text-sm text-blistTextMuted">
                      {p.submissionRole}{p.location ? ` · ${p.location}` : ""}
                    </div>
                  </div>
                  <Badge level={badge} size="sm" />
                </div>

                {(p.skills.length > 0 || p.tags.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.skills.slice(0, 6).map((x) => (
                      <span key={`s-${p.id}-${x}`} className={`text-xs rounded-full px-2 py-1 border ${
                        filterSkills.includes(x)
                          ? "bg-blistAccent/20 border-blistAccent text-white"
                          : "bg-white/5 border-blistBorder text-white/90"
                      }`}>
                        {x}
                      </span>
                    ))}
                    {p.tags.slice(0, 6).map((x) => (
                      <span key={`t-${p.id}-${x}`} className="text-xs rounded-full bg-blistAccent/15 border border-blistAccent/30 px-2 py-1 text-white/90">
                        {x}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
