import Link from "next/link";
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeaturedProfiles() {
  noStore();
  
  const featured = await prisma.profile.findMany({
    where: { status: "APPROVED" },
    orderBy: { reviewedAt: "desc" },
    take: 6,
    select: {
      id: true,
      displayName: true,
      handle: true,
      submissionRole: true,
      location: true,
      skills: true,
      tags: true,
    },
  });

  if (featured.length === 0) {
    return (
      <div className="rounded-2xl border border-vampBorder bg-black/40 p-5 text-vampTextMuted">
        No verified profiles yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {featured.map((p) => (
        <Link
          key={p.id}
          href={`/directory/${p.id}`}
          className="rounded-2xl border border-vampBorder bg-black/40 p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-white font-semibold truncate">
                {p.displayName}
                {p.handle ? (
                  <span className="text-vampTextMuted font-normal"> · @{p.handle}</span>
                ) : null}
              </div>
              <div className="text-sm text-vampTextMuted truncate">
                {p.submissionRole}
                {p.location ? ` · ${p.location}` : ""}
              </div>
              {(p.skills.length > 0 || p.tags.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.skills.slice(0, 3).map((x) => (
                    <span
                      key={`s-${p.id}-${x}`}
                      className="text-[11px] rounded-full bg-white/5 border border-vampBorder px-2 py-1 text-white/90"
                    >
                      {x}
                    </span>
                  ))}
                  {p.tags.slice(0, 3).map((x) => (
                    <span
                      key={`t-${p.id}-${x}`}
                      className="text-[11px] rounded-full bg-vampAccent/15 border border-vampAccent/30 px-2 py-1 text-white/90"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 text-xs text-emerald-300/90">
              Verified
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
