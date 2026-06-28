import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getMemberSession } from "@/app/member/actions";
import { TrustScorePanel } from "@/components/TrustScorePanel";
import { Badge } from "@/components/Badge";
import { getBadgeFromScore } from "@/lib/badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blistAccent hover:underline break-all"
    >
      {children}
    </a>
  );
}

function maybeLink(value: string | null | undefined, label: string) {
  if (!value) return null;
  const isUrl = value.startsWith("http://") || value.startsWith("https://");
  return (
    <div className="flex gap-2">
      <span className="text-blistTextMuted shrink-0">{label}:</span>
      {isUrl ? (
        <ExternalLink href={value}>{value}</ExternalLink>
      ) : (
        <span className="text-white/80 break-all">{value}</span>
      )}
    </div>
  );
}

export default async function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      references: true,
      trustScoreAudits: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!profile) return notFound();

  const member = await getMemberSession();
  const hasReviewAccess = member && (
    member.userRoles.includes("REVIEWER") ||
    member.userRoles.includes("APPROVER") ||
    member.userRoles.includes("ADMIN")
  );

  if (profile.status !== "APPROVED" && !hasReviewAccess) return notFound();

  const score = (profile as any).trustScore ?? 0;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-semibold text-white">
            {profile.displayName}
            {profile.handle ? <span className="text-blistTextMuted text-base"> · @{profile.handle}</span> : null}
          </h1>
          {profile.status === "APPROVED" && (
            <Badge
              level={
                (profile as any).badgeLevel ??
                getBadgeFromScore(score, true)
              }
              size="lg"
            />
          )}
        </div>
        <div className="mt-1 text-blistTextMuted">
          {profile.submissionRole}{profile.location ? ` · ${profile.location}` : ""}
        </div>
        {profile.status === "APPROVED" && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-blistTextMuted">Trust Score:</span>
            <span className="text-sm font-bold text-blistAccent">{score}/100</span>
          </div>
        )}
      </div>

      {profile.bio && (
        <div className="rounded-2xl border border-blistBorder bg-black/40 p-5 text-white/90">
          {profile.bio}
        </div>
      )}

      {(profile.skills.length > 0 || profile.tags.length > 0) && (
        <div className="rounded-2xl border border-blistBorder bg-black/40 p-5">
          <div className="text-sm font-semibold text-white mb-3">Skills & Tags</div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((x) => (
              <span key={`s-${x}`} className="text-xs rounded-full bg-white/5 border border-blistBorder px-2 py-1 text-white/90">
                {x}
              </span>
            ))}
            {profile.tags.map((x) => (
              <span key={`t-${x}`} className="text-xs rounded-full bg-blistAccent/15 border border-blistAccent/30 px-2 py-1 text-white/90">
                {x}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-blistBorder bg-black/40 p-5 space-y-2 text-sm">
        <div className="text-sm font-semibold text-white mb-3">Contact & Links</div>
        {maybeLink(profile.website, "Website")}
        {maybeLink(profile.github, "GitHub")}
        {maybeLink(profile.linkedin, "LinkedIn")}
        {profile.xHandle && (
          <div className="flex gap-2">
            <span className="text-blistTextMuted shrink-0">X (Twitter):</span>
            <ExternalLink href={`https://twitter.com/${profile.xHandle.replace(/^@/, "")}`}>
              {profile.xHandle}
            </ExternalLink>
          </div>
        )}
        {profile.telegram && (
          <div className="flex gap-2">
            <span className="text-blistTextMuted shrink-0">Telegram:</span>
            <span className="text-white/80">{profile.telegram}</span>
          </div>
        )}
        {profile.chain && (
          <div className="flex gap-2">
            <span className="text-blistTextMuted shrink-0">Chain:</span>
            <span className="text-white/80 capitalize">{profile.chain}</span>
          </div>
        )}
        {profile.wallet && (
          <div className="flex gap-2">
            <span className="text-blistTextMuted shrink-0">Wallet:</span>
            <span className="text-white/80 font-mono break-all text-xs">{profile.wallet}</span>
          </div>
        )}
      </div>

      {(profile as any).portfolioLinks?.length > 0 && (
        <div className="rounded-2xl border border-blistBorder bg-black/40 p-5">
          <div className="text-sm font-semibold text-white mb-3">Portfolio & Work</div>
          <div className="space-y-2">
            {(profile as any).portfolioLinks.map((link: string, i: number) => (
              <div key={i}>
                <ExternalLink href={link}>{link}</ExternalLink>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.status === "APPROVED" && (
        <TrustScorePanel
          score={score}
          audits={profile.trustScoreAudits}
        />
      )}

      <div className="rounded-2xl border border-blistBorder bg-black/40 p-5">
        <div className="text-sm font-semibold text-white mb-3">References</div>

        {profile.references.length === 0 ? (
          <div className="text-blistTextMuted text-sm">No references provided.</div>
        ) : (
          <div className="space-y-3">
            {profile.references.map((r) => (
              <div key={r.id} className="rounded-2xl border border-blistBorder/60 bg-black/30 p-4">
                <div className="text-white font-semibold">{r.name}</div>
                <div className="text-sm text-blistTextMuted">
                  {r.relationship ? r.relationship : "Reference"}
                </div>
                {(r.contact || r.link) && (
                  <div className="mt-2 text-sm space-y-1">
                    {r.contact && (
                      <div className="flex gap-2">
                        <span className="text-blistTextMuted shrink-0">Contact:</span>
                        <span className="text-white/80 break-all">{r.contact}</span>
                      </div>
                    )}
                    {r.link && (
                      <div className="flex gap-2">
                        <span className="text-blistTextMuted shrink-0">Link:</span>
                        {r.link.startsWith("http") ? (
                          <ExternalLink href={r.link}>{r.link}</ExternalLink>
                        ) : (
                          <span className="text-white/80 break-all">{r.link}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {r.notes && <div className="mt-2 text-sm text-white/90">{r.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
