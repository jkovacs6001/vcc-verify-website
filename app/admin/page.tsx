import { prisma } from "@/lib/db";
import { getMemberSession } from "../member/actions";
import { redirect } from "next/navigation";
import { MemberRowEditor } from "@/components/MemberRowEditor";
import { ScamReportRow } from "@/components/ScamReportRow";
import { ProjectReviewRow } from "@/components/ProjectReviewRow";
import { BlacklistedWalletRow, ConfirmedReportRow } from "@/components/BlacklistEntryRow";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-vampAccent hover:underline break-all">
      {children}
    </a>
  );
}

function LinkOrText({ value }: { value: string }) {
  const isUrl = value.startsWith("http://") || value.startsWith("https://");
  return isUrl ? <ExternalLink href={value}>{value}</ExternalLink> : <span className="break-all">{value}</span>;
}

function ApplicationCardReadOnly({ p, references }: { p: any; references?: any[] }) {
  const hasAutoFlag = p.reviewerNote?.startsWith("[Auto-flagged:");
  const missingX = !p.xHandle;
  const missingTelegram = !p.telegram;
  const flagged = missingX && missingTelegram;

  return (
    <div className={`rounded-2xl border bg-black/40 p-4 space-y-4 ${flagged ? "border-yellow-500/40" : "border-vampBorder"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-semibold text-white">
            {p.displayName}
            {p.handle ? <span className="text-vampTextMuted text-sm"> · @{p.handle}</span> : null}
          </div>
          <div className="text-sm text-vampTextMuted mt-0.5">
            {p.submissionRole}{p.location ? ` · ${p.location}` : ""}
          </div>
          <div className="mt-1 text-xs text-vampTextMuted break-all">{p.email}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Link
            href={`/directory/${p.id}`}
            className="rounded-full bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10 border border-vampBorder transition-colors"
          >
            View Profile
          </Link>
          <div className="text-xs text-vampTextMuted">
            Score: <span className="text-vampAccent font-bold">{p.trustScore ?? 0}/100</span>
          </div>
        </div>
      </div>

      {/* Auto-flag warning */}
      {hasAutoFlag && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          ⚠ {p.reviewerNote}
        </div>
      )}

      {/* Bio */}
      {p.bio && <p className="text-sm text-white/80">{p.bio}</p>}

      {/* Skills + Tags */}
      {(p.skills.length > 0 || p.tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {p.skills.slice(0, 12).map((x: string) => (
            <span key={`s-${p.id}-${x}`} className="text-xs rounded-full bg-white/5 border border-vampBorder px-2 py-1 text-white/90">{x}</span>
          ))}
          {p.tags.slice(0, 12).map((x: string) => (
            <span key={`t-${p.id}-${x}`} className="text-xs rounded-full bg-vampAccent/15 border border-vampAccent/30 px-2 py-1 text-white/90">{x}</span>
          ))}
        </div>
      )}

      {/* Social & Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs">
        {p.xHandle ? (
          <div className="flex gap-1.5">
            <span className="text-vampTextMuted shrink-0">X:</span>
            <ExternalLink href={`https://twitter.com/${p.xHandle.replace(/^@/, "")}`}>{p.xHandle}</ExternalLink>
          </div>
        ) : (
          <div className="flex gap-1.5 text-yellow-400/70">
            <span className="shrink-0">X:</span><span>—</span>
          </div>
        )}
        {p.telegram ? (
          <div className="flex gap-1.5">
            <span className="text-vampTextMuted shrink-0">Telegram:</span>
            <span className="text-white/80">{p.telegram}</span>
          </div>
        ) : (
          <div className="flex gap-1.5 text-yellow-400/70">
            <span className="shrink-0">Telegram:</span><span>—</span>
          </div>
        )}
        {p.github && (
          <div className="flex gap-1.5">
            <span className="text-vampTextMuted shrink-0">GitHub:</span>
            <ExternalLink href={p.github}>{p.github}</ExternalLink>
          </div>
        )}
        {p.linkedin && (
          <div className="flex gap-1.5">
            <span className="text-vampTextMuted shrink-0">LinkedIn:</span>
            <ExternalLink href={p.linkedin}>{p.linkedin}</ExternalLink>
          </div>
        )}
        {p.website && (
          <div className="flex gap-1.5">
            <span className="text-vampTextMuted shrink-0">Website:</span>
            <ExternalLink href={p.website}>{p.website}</ExternalLink>
          </div>
        )}
        {p.wallet && (
          <div className="flex gap-1.5">
            <span className="text-vampTextMuted shrink-0">Wallet:</span>
            <span className="font-mono text-white/70 break-all">{p.wallet} <span className="text-vampTextMuted">({p.chain})</span></span>
          </div>
        )}
      </div>

      {/* Portfolio / Proof of Work */}
      {p.portfolioLinks?.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-white">Portfolio / Proof of Work</div>
          {p.portfolioLinks.map((link: string, i: number) => (
            <div key={i} className="text-xs">
              <ExternalLink href={link}>{link}</ExternalLink>
            </div>
          ))}
        </div>
      )}

      {/* References */}
      {references && references.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white">References ({references.length})</div>
          {references.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-vampBorder/60 bg-black/30 p-3 space-y-1">
              <div className="text-sm text-white font-semibold">{r.name}</div>
              {r.relationship && <div className="text-xs text-vampTextMuted">{r.relationship}</div>}
              {r.contact && <div className="text-xs text-vampTextMuted">Contact: {r.contact}</div>}
              {r.link && (
                <div className="text-xs">
                  <span className="text-vampTextMuted">Link: </span>
                  <LinkOrText value={r.link} />
                </div>
              )}
              {r.notes && <div className="text-xs text-white/80">{r.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const member = await getMemberSession();

  if (!member || !member.userRoles.includes("ADMIN")) {
    redirect("/member");
  }

  const allMembers = await prisma.profile.findMany({ orderBy: { createdAt: "desc" } });

  const blacklistedWallets = await prisma.blacklistedWallet.findMany({
    orderBy: { confirmedAt: "desc" },
  });

  const confirmedReports = await prisma.scamReport.findMany({
    where: { status: "CONFIRMED" },
    orderBy: { reviewedAt: "desc" },
  });

  const scamReports = await prisma.scamReport.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  const pendingProjects = await prisma.project.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  const reviewQueue = await prisma.profile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { references: true },
  });

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
          Manage users, roles, and oversee application queues.
        </p>
      </div>

      {/* Scam Reports Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Scam Reports
            {scamReports.length > 0 && (
              <span className="ml-2 text-sm font-normal text-red-400">
                ({scamReports.length} pending)
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            Reports submitted by the community for review
          </p>
        </div>

        {scamReports.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No pending scam reports.
          </div>
        ) : (
          <div className="space-y-3">
            {scamReports.map((r) => (
              <ScamReportRow key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>

      {/* Blacklist Management Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Blacklist Management
            {(blacklistedWallets.length + confirmedReports.length) > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({blacklistedWallets.length + confirmedReports.length} entries)
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            Edit or remove confirmed blacklist entries
          </p>
        </div>

        {blacklistedWallets.length === 0 && confirmedReports.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No blacklisted entries yet.
          </div>
        ) : (
          <div className="space-y-3">
            {blacklistedWallets.map((e) => (
              <BlacklistedWalletRow key={e.id} entry={e} />
            ))}
            {confirmedReports.map((r) => (
              <ConfirmedReportRow key={r.id} entry={r} />
            ))}
          </div>
        )}
      </section>

      {/* Project Applications Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Project Applications
            {pendingProjects.length > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({pendingProjects.length} pending)
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            Crypto projects applying for VCC verification
          </p>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No pending project applications.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProjects.map((p) => (
              <ProjectReviewRow key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* All Members Section */}
      <section className="space-y-4">
        <div className="border-b border-vampBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            All Members
            {allMembers.length > 0 && (
              <span className="ml-2 text-sm font-normal text-vampAccent">
                ({allMembers.length})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-vampTextMuted">
            All registered users and their roles
          </p>
        </div>

        {allMembers.length === 0 ? (
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
            No members yet.
          </div>
        ) : (
          <div className="space-y-2">
            {allMembers.map((p) => (
              <MemberRowEditor key={p.id} profile={p} />
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
