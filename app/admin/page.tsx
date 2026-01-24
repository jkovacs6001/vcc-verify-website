import { prisma } from "@/lib/db";
import { getMemberSession } from "../member/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ApplicationCardReadOnly({ p, references }: { p: any; references?: any[] }) {
  return (
    <div className="rounded-2xl border border-vampBorder bg-black/40 p-4">
      <div className="min-w-0">
        <div className="text-lg font-semibold text-white">
          {p.displayName}{p.handle ? <span className="text-vampTextMuted text-sm"> · @{p.handle}</span> : null}
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
            {p.skills.slice(0, 12).map((x: string) => (
              <span key={`s-${p.id}-${x}`} className="text-xs rounded-full bg-white/5 border border-vampBorder px-2 py-1 text-white/90">
                {x}
              </span>
            ))}
            {p.tags.slice(0, 12).map((x: string) => (
              <span key={`t-${p.id}-${x}`} className="text-xs rounded-full bg-vampAccent/15 border border-vampAccent/30 px-2 py-1 text-white/90">
                {x}
              </span>
            ))}
          </div>
        )}

        {references && references.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-white">References ({references.length})</div>
            {references.map((r: any) => (
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
    </div>
  );
}

export default async function AdminPage() {
  const member = await getMemberSession();

  // Only users with ADMIN role can access this page
  if (!member || !member.userRoles.includes("ADMIN")) {
    redirect("/member");
  }

  // Fetch approved members
  const members = await prisma.profile.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  // Fetch accounts without verification applications
  const accountsOnly = await prisma.profile.findMany({
    where: { status: null },
    orderBy: { createdAt: "desc" },
  });

  // Fetch review queue
  const reviewQueue = await prisma.profile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { references: true },
  });

  // Fetch approval queue
  const approvalQueue = await prisma.profile.findMany({
    where: { status: "READY_FOR_APPROVAL" },
    orderBy: { createdAt: "asc" },
    include: { references: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-vampTextMuted">
          Read-only oversight of all queues and members.
        </p>
      </div>

      {/* Accounts Only Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Account-Only Users
            {accountsOnly.length > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({accountsOnly.length})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            Registered users who haven't applied for verification
          </p>
        </div>

        {accountsOnly.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No account-only users.
          </div>
        ) : (
          <div className="space-y-4">
            {accountsOnly.map((p) => (
              <div key={p.id} className="rounded-2xl border border-vampBorder bg-black/40 p-4">
                <div className="text-lg font-semibold text-white">{p.displayName}</div>
                <div className="text-sm text-vampTextMuted break-all">{p.email}</div>
                <div className="mt-2 text-xs text-white/60">
                  Roles: {p.userRoles.join(", ")} · Joined: {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Members Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Verified Members
            {members.length > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({members.length})
              </span>
            )}
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No verified members yet.
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((p) => (
              <ApplicationCardReadOnly key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Review Queue Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Review Queue
            {reviewQueue.length > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({reviewQueue.length})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            Applications awaiting reviewer assessment
          </p>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No pending applications.
          </div>
        ) : (
          <div className="space-y-4">
            {reviewQueue.map((p) => (
              <ApplicationCardReadOnly key={p.id} p={p} references={p.references} />
            ))}
          </div>
        )}
      </section>

      {/* Approval Queue Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Approval Queue
            {approvalQueue.length > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({approvalQueue.length})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            Applications ready for final approval
          </p>
        </div>

        {approvalQueue.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No applications ready for approval.
          </div>
        ) : (
          <div className="space-y-4">
            {approvalQueue.map((p) => (
              <ApplicationCardReadOnly key={p.id} p={p} references={p.references} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
