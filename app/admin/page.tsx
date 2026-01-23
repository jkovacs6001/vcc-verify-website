import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { adminLogin, approveProfile, rejectProfile } from "./actions";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_token")?.value === process.env.ADMIN_TOKEN;

  if (!isAuthed) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Admin</h1>
        <form action={adminLogin} className="space-y-3">
          <input
            name="token"
            placeholder="Admin token"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white"
          />
          <button className="rounded-full bg-vampAccent px-5 py-2 text-white shadow-vampGlow">
            Login
          </button>
        </form>
      </div>
    );
  }

  const pending = await prisma.profile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { references: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Admin review</h1>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
          No pending applications.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="rounded-2xl border border-vampBorder bg-black/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">
                    {p.displayName}{p.handle ? <span className="text-vampTextMuted text-sm"> · @{p.handle}</span> : null}
                  </div>
                  <div className="text-sm text-vampTextMuted">
                    {p.role}{p.location ? ` · ${p.location}` : ""}
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
                      <div className="text-xs font-semibold text-white">References</div>
                      {p.references.map((r) => (
                        <div key={r.id} className="rounded-xl border border-vampBorder/60 bg-black/30 p-3">
                          <div className="text-sm text-white font-semibold">{r.name}</div>
                          <div className="text-xs text-vampTextMuted">{r.relationship ?? "Reference"}</div>
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
                  <form action={async () => { "use server"; await approveProfile(p.id, "Approved"); }}>
                    <button className="w-full rounded-full bg-emerald-600/80 px-4 py-2 text-white">
                      Approve
                    </button>
                  </form>

                  <form action={async () => { "use server"; await rejectProfile(p.id, "Rejected"); }}>
                    <button className="w-full rounded-full bg-red-600/70 px-4 py-2 text-white">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
