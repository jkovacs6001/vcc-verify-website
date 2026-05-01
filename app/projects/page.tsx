import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: "APPROVED" },
    orderBy: { trustScore: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Verified Projects</h1>
          <p className="mt-2 text-vampTextMuted text-sm">
            Crypto projects that have been reviewed and approved by the VCC team.
          </p>
        </div>
        <Link
          href="/projects/apply"
          className="shrink-0 rounded-full bg-vampAccent px-4 py-2 text-sm font-medium text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
        >
          Apply for Verification
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-8 text-center text-vampTextMuted">
          <div className="text-lg font-medium text-white mb-2">No verified projects yet</div>
          <p className="text-sm">Be the first project to apply for VCC verification.</p>
          <Link
            href="/projects/apply"
            className="mt-4 inline-block rounded-full border border-vampAccent/40 px-4 py-2 text-sm text-vampAccent hover:bg-vampAccent/10 transition-colors"
          >
            Submit Your Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-vampBorder bg-black/40 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{p.name}</div>
                  <div className="text-xs text-vampTextMuted capitalize mt-0.5">{p.chain}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-vampAccent">{p.trustScore}</div>
                  <div className="text-xs text-vampTextMuted">trust score</div>
                </div>
              </div>

              <p className="mt-3 text-sm text-white/80 line-clamp-2">{p.description}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-vampTextMuted">
                {p.website && (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-vampAccent hover:underline">
                    Website ↗
                  </a>
                )}
                {p.twitterHandle && <span>@{p.twitterHandle}</span>}
                {p.contractAddress && (
                  <span className="font-mono">{p.contractAddress.slice(0, 8)}…</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
