import { prisma } from "@/lib/db";
import Link from "next/link";
import { getMemberSession } from "@/app/member/actions";
import { CommentSection } from "@/components/CommentSection";
import { ApproveActions } from "@/components/ApproveActions";
import { addComment } from "@/app/approve/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireApproverAccess() {
  const member = await getMemberSession();

  if (!member || (!member.userRoles.includes("APPROVER") && !member.userRoles.includes("ADMIN"))) {
    return null;
  }

  return member;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blistAccent hover:underline break-all">
      {children}
    </a>
  );
}

function LinkOrText({ value }: { value: string }) {
  const isUrl = value.startsWith("http://") || value.startsWith("https://");
  return isUrl ? <ExternalLink href={value}>{value}</ExternalLink> : <span className="break-all">{value}</span>;
}

function ApplicationCard({ p }: { p: any }) {
  const hasAutoFlag = p.reviewerNote?.startsWith("[Auto-flagged:");
  const missingX = !p.xHandle;
  const missingTelegram = !p.telegram;
  const flagged = missingX && missingTelegram;

  return (
    <div className={`rounded-2xl border bg-black/40 p-4 space-y-4 ${flagged ? "border-yellow-500/40" : "border-blistBorder"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-white">
            {p.displayName}
            {p.handle ? <span className="text-blistTextMuted text-sm"> · @{p.handle}</span> : null}
          </div>
          <div className="text-sm text-blistTextMuted mt-0.5">
            {p.submissionRole}{p.location ? ` · ${p.location}` : ""}
          </div>
          <div className="mt-1 text-xs text-blistTextMuted break-all">{p.email}</div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            href={`/directory/${p.id}`}
            className="rounded-full bg-white/5 px-4 py-2 text-center text-white text-sm hover:bg-white/10 border border-blistBorder transition-colors whitespace-nowrap"
          >
            View Profile
          </Link>
          <div className="text-xs text-blistTextMuted text-right">
            Score: <span className="text-blistAccent font-bold">{p.trustScore ?? 0}/100</span>
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
            <span key={`s-${p.id}-${x}`} className="text-xs rounded-full bg-white/5 border border-blistBorder px-2 py-1 text-white/90">{x}</span>
          ))}
          {p.tags.slice(0, 12).map((x: string) => (
            <span key={`t-${p.id}-${x}`} className="text-xs rounded-full bg-blistAccent/15 border border-blistAccent/30 px-2 py-1 text-white/90">{x}</span>
          ))}
        </div>
      )}

      {/* Social & Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs">
        {p.xHandle ? (
          <div className="flex gap-1.5">
            <span className="text-blistTextMuted shrink-0">X:</span>
            <ExternalLink href={`https://twitter.com/${p.xHandle.replace(/^@/, "")}`}>{p.xHandle}</ExternalLink>
          </div>
        ) : (
          <div className="flex gap-1.5 text-yellow-400/70">
            <span className="shrink-0">X:</span><span>— missing</span>
          </div>
        )}
        {p.telegram ? (
          <div className="flex gap-1.5">
            <span className="text-blistTextMuted shrink-0">Telegram:</span>
            <span className="text-white/80">{p.telegram}</span>
          </div>
        ) : (
          <div className="flex gap-1.5 text-yellow-400/70">
            <span className="shrink-0">Telegram:</span><span>— missing</span>
          </div>
        )}
        {p.github && (
          <div className="flex gap-1.5">
            <span className="text-blistTextMuted shrink-0">GitHub:</span>
            <ExternalLink href={p.github}>{p.github}</ExternalLink>
          </div>
        )}
        {p.linkedin && (
          <div className="flex gap-1.5">
            <span className="text-blistTextMuted shrink-0">LinkedIn:</span>
            <ExternalLink href={p.linkedin}>{p.linkedin}</ExternalLink>
          </div>
        )}
        {p.website && (
          <div className="flex gap-1.5">
            <span className="text-blistTextMuted shrink-0">Website:</span>
            <ExternalLink href={p.website}>{p.website}</ExternalLink>
          </div>
        )}
        {p.wallet && (
          <div className="flex gap-1.5">
            <span className="text-blistTextMuted shrink-0">Wallet:</span>
            <span className="font-mono text-white/70 break-all">{p.wallet} <span className="text-blistTextMuted">({p.chain})</span></span>
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
      {p.references && p.references.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white">References ({p.references.length})</div>
          {p.references.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-blistBorder/60 bg-black/30 p-3 space-y-1">
              <div className="text-sm text-white font-semibold">{r.name}</div>
              {r.relationship && <div className="text-xs text-blistTextMuted">{r.relationship}</div>}
              {r.contact && <div className="text-xs text-blistTextMuted">Contact: {r.contact}</div>}
              {r.link && (
                <div className="text-xs">
                  <span className="text-blistTextMuted">Link: </span>
                  <LinkOrText value={r.link} />
                </div>
              )}
              {r.notes && <div className="text-xs text-white/80">{r.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Approve Actions */}
      <div className="pt-4 border-t border-blistBorder/50">
        <ApproveActions profileId={p.id} status={p.status} />
      </div>

      {/* Comment Section */}
      <div className="pt-4 border-t border-blistBorder/50">
        <CommentSection profileId={p.id} comments={p.comments || []} addCommentAction={addComment} />
      </div>
    </div>
  );
}

export default async function ApprovePage() {
  const member = await requireApproverAccess();

  if (!member) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Approvals</h1>
        <p className="mt-2 text-blistTextMuted">
          You do not have access to this page. Only approvers can access the approval queue.
        </p>
        <Link
          href="/member"
          className="inline-flex items-center justify-center rounded-full bg-blistAccent px-5 py-2.5 text-white shadow-blistGlow hover:bg-blistAccentSoft transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const reviewQueue = await prisma.profile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      references: true,
      comments: {
        include: {
          author: {
            select: { displayName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const approvalQueue = await prisma.profile.findMany({
    where: { status: "READY_FOR_APPROVAL" },
    orderBy: { createdAt: "asc" },
    include: {
      references: true,
      comments: {
        include: {
          author: {
            select: { displayName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Approvals</h1>
        <p className="mt-2 text-blistTextMuted">
          Review and approve applications for verification.
        </p>
      </div>

      {/* Review Queue Section */}
      <section className="space-y-4">
        <div className="border-b border-blistBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Review Queue
            {reviewQueue.length > 0 && (
              <span className="ml-2 text-sm font-normal text-blistAccent">
                ({reviewQueue.length})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-blistTextMuted">
            Applications awaiting initial review
          </p>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="rounded-2xl border border-blistBorder bg-black/40 p-6 text-blistTextMuted">
            No applications waiting for review.
          </div>
        ) : (
          <div className="space-y-4">
            {reviewQueue.map((p) => (
              <ApplicationCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Approval Queue Section */}
      <section className="space-y-4">
        <div className="border-b border-blistBorder pb-3">
          <h2 className="text-xl font-semibold text-white">
            Approval Queue
            {approvalQueue.length > 0 && (
              <span className="ml-2 text-sm font-normal text-blistAccent">
                ({approvalQueue.length})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-blistTextMuted">
            Applications ready for final approval
          </p>
        </div>

        {approvalQueue.length === 0 ? (
          <div className="rounded-2xl border border-blistBorder bg-black/40 p-6 text-blistTextMuted">
            No applications waiting for approval.
          </div>
        ) : (
          <div className="space-y-4">
            {approvalQueue.map((p) => (
              <ApplicationCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
