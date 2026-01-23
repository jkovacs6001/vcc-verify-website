import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DirectoryPage() {
  const profiles = await prisma.profile.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      displayName: true,
      handle: true,
      submissionRole: true,
      location: true,
      tags: true,
      skills: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Directory</h1>

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
          No approved profiles yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <Link
              key={p.id}
              href={`/directory/${p.id}`}
              className="rounded-2xl border border-vampBorder bg-black/40 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {p.displayName}
                    {p.handle ? <span className="text-vampTextMuted text-sm"> · @{p.handle}</span> : null}
                  </div>
                  <div className="text-sm text-vampTextMuted">
                    {p.submissionRole}{p.location ? ` · ${p.location}` : ""}
                  </div>
                </div>
              </div>

              {(p.skills.length > 0 || p.tags.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.skills.slice(0, 6).map((x) => (
                    <span key={`s-${p.id}-${x}`} className="text-xs rounded-full bg-white/5 border border-vampBorder px-2 py-1 text-white/90">
                      {x}
                    </span>
                  ))}
                  {p.tags.slice(0, 6).map((x) => (
                    <span key={`t-${p.id}-${x}`} className="text-xs rounded-full bg-vampAccent/15 border border-vampAccent/30 px-2 py-1 text-white/90">
                      {x}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
