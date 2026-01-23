import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import Link from "next/link";
import { getMemberSession } from "@/app/member/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireReviewerAccess() {
  const member = await getMemberSession();

  if (!member || (member.userRole !== "REVIEWER" && member.userRole !== "APPROVER")) {
    return null;
  }

  return member;
}

export default async function ReviewPage() {
  const member = await requireReviewerAccess();

  if (!member) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Review Applications</h1>
        <p className="mt-2 text-vampTextMuted">
          You do not have access to this page. Please sign in with a reviewer or approver account.
        </p>
        <Link
          href="/member"
          className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch pending applications waiting for review
  const pending = await prisma.profile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { references: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Review Queue</h1>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
          No pending applications to review.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="rounded-2xl border border-vampBorder bg-black/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">
                    {p.displayName}
                    {p.handle ? <span className="text-vampTextMuted text-sm"> · @{p.handle}</span> : null}
                  </div>
                  <div className="text-sm text-vampTextMuted">
                    {p.submissionRole}{p.location ? ` · ${p.location}` : ""}
                  </div>
                  <div className="mt-2 text-xs text-vampTextMuted break-all">
                    {p.email} · {p.chain}:{p.wallet ?? "(none)"}
                  </div>

                  {p.bio && <div className="mt-3 text-sm text-white/90">{p.bio}</div>}

                  {(p.skills.length > 0 || p.tags.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.skills.slice(0, 12).map((x) => (
                        <span key={`s-${p.id}-${x}`} className="text-xs rounded-full bg-white/5 border border-vampBorder px-2 py-1 text-white/90">
                          {x}
                        </span>
                      ))}
                      {p.tags.slice(0, 12).map((x) => (
                        <span key={`t-${p.id}-${x}`} className="text-xs rounded-full bg-vampAccent/15 border border-vampAccent/30 px-2 py-1 text-white/90">
                          {x}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.references.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-semibold text-white">References ({p.references.length})</div>
                      {p.references.map((r) => (
                        <div key={r.id} className="rounded-xl border border-vampBorder/60 bg-black/30 p-3">
                          <div className="text-sm text-white font-semibold">{r.name}</div>
                          {r.relationship && <div className="text-xs text-vampTextMuted">{r.relationship}</div>}
                          {(r.contact || r.link) && (
                            <div className="mt-1 text-xs text-vampTextMuted space-y-1 break-all">
                              {r.contact && <div>Contact: {r.contact}</div>}
                              {r.link && <div>Link: {r.link}</div>}
                            </div>
                          )}
                          {r.notes && <div className="mt-1 text-xs text-white/80">{r.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/directory/${p.id}`}
                    className="rounded-full bg-white/5 px-4 py-2 text-center text-white text-sm hover:bg-white/10 border border-vampBorder transition-colors"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
