import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getMemberSession } from "@/app/member/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { references: true },
  });

  if (!profile) return notFound();

  // Check if user has permission to view non-approved profiles
  const member = await getMemberSession();
  const hasReviewAccess = member && (
    member.userRoles.includes("REVIEWER") ||
    member.userRoles.includes("APPROVER") ||
    member.userRoles.includes("ADMIN")
  );

  // Only show approved profiles to the public, or any profile to reviewers/approvers/admins
  if (profile.status !== "APPROVED" && !hasReviewAccess) return notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">
          {profile.displayName}
          {profile.handle ? <span className="text-vampTextMuted text-base"> · @{profile.handle}</span> : null}
        </h1>
        <div className="mt-1 text-vampTextMuted">
          {profile.submissionRole}{profile.location ? ` · ${profile.location}` : ""}
        </div>
      </div>

      {profile.bio && (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-5 text-white/90">
          {profile.bio}
        </div>
      )}

      {(profile.skills.length > 0 || profile.tags.length > 0) && (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-5">
          <div className="text-sm font-semibold text-white mb-3">Skills & tags</div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((x) => (
              <span key={`s-${x}`} className="text-xs rounded-full bg-white/5 border border-vampBorder px-2 py-1 text-white/90">
                {x}
              </span>
            ))}
            {profile.tags.map((x) => (
              <span key={`t-${x}`} className="text-xs rounded-full bg-vampAccent/15 border border-vampAccent/30 px-2 py-1 text-white/90">
                {x}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-2 text-sm text-white/90">
        {profile.website && <div>Website: <span className="text-vampTextMuted">{profile.website}</span></div>}
        {profile.github && <div>GitHub: <span className="text-vampTextMuted">{profile.github}</span></div>}
        {profile.linkedin && <div>LinkedIn: <span className="text-vampTextMuted">{profile.linkedin}</span></div>}
        {profile.xHandle && <div>X: <span className="text-vampTextMuted">{profile.xHandle}</span></div>}
        {profile.telegram && <div>Telegram: <span className="text-vampTextMuted">{profile.telegram}</span></div>}
        <div>Chain: <span className="text-vampTextMuted">{profile.chain}</span></div>
        {profile.wallet && <div>Wallet: <span className="text-vampTextMuted break-all">{profile.wallet}</span></div>}
      </div>

      <div className="rounded-2xl border border-vampBorder bg-black/40 p-5">
        <div className="text-sm font-semibold text-white mb-3">References</div>

        {profile.references.length === 0 ? (
          <div className="text-vampTextMuted text-sm">No references provided.</div>
        ) : (
          <div className="space-y-3">
            {profile.references.map((r) => (
              <div key={r.id} className="rounded-2xl border border-vampBorder/60 bg-black/30 p-4">
                <div className="text-white font-semibold">{r.name}</div>
                <div className="text-sm text-vampTextMuted">
                  {r.relationship ? r.relationship : "Reference"}
                </div>
                {(r.contact || r.link) && (
                  <div className="mt-2 text-sm text-white/90 space-y-1">
                    {r.contact && <div>Contact: <span className="text-vampTextMuted">{r.contact}</span></div>}
                    {r.link && <div>Link: <span className="text-vampTextMuted break-all">{r.link}</span></div>}
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
