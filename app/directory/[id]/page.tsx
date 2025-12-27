import { notFound } from "next/navigation";
import { MOCK_PROFESSIONALS } from "../../../lib/mockData";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default function ProfilePage({ params }: Props) {
  const prof = MOCK_PROFESSIONALS.find((p) => p.id === params.id);
  if (!prof) return notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/directory"
        className="cursor-paw-pointer text-xs text-textMuted hover:text-textMain"
      >
        ← Back to directory
      </Link>

      <section className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{prof.name}</h1>
            <p className="text-sm text-textMuted">
              {prof.role}
              {prof.alias && ` · @${prof.alias}`}
              {prof.region && ` · ${prof.region}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {prof.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-white/5 text-textMuted"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <h2 className="text-xs font-semibold mb-1 text-textMain/90">
                Recent projects
              </h2>
              <ul className="text-textMuted text-[13px] list-disc list-inside">
                {prof.projects.map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold mb-1 text-textMain/90">
                Verification summary
              </h2>
              <p className="text-[13px] text-textMuted">
                This profile is part of the VCC Verification MVP. In a live
                environment, the VCC team reviews references, on-chain history,
                and prior collaborations before marking a professional as
                verified.
              </p>
              {prof.verifiedAt && (
                <p className="text-[11px] text-textMuted mt-1">
                  Marked verified on {prof.verifiedAt}.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface border border-white/10 p-4 space-y-3 text-sm">
            <h2 className="text-xs font-semibold text-textMain/90">
              Contact & links
            </h2>
            <div className="space-y-2 text-[13px] text-textMuted">
              {prof.twitter && (
                <div>
                  <span className="font-medium text-textMain mr-1">
                    Twitter:
                  </span>
                  <a
                    className="cursor-paw-pointer text-accentSoft hover:text-accent"
                    href={prof.twitter}
                    target="_blank"
                  >
                    {prof.twitter}
                  </a>
                </div>
              )}
              {prof.telegram && (
                <div>
                  <span className="font-medium text-textMain mr-1">
                    Telegram:
                  </span>
                  <a
                    className="cursor-paw-pointer text-accentSoft hover:text-accent"
                    href={prof.telegram}
                    target="_blank"
                  >
                    {prof.telegram}
                  </a>
                </div>
              )}
              {prof.website && (
                <div>
                  <span className="font-medium text-textMain mr-1">
                    Website:
                  </span>
                  <a
                    className="cursor-paw-pointer text-accentSoft hover:text-accent"
                    href={prof.website}
                    target="_blank"
                  >
                    {prof.website}
                  </a>
                </div>
              )}
              <div>
                <span className="font-medium text-textMain mr-1">Wallet:</span>
                <span className="font-mono text-[11px] break-all">
                  {prof.wallet}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surfaceSoft border border-dashed border-accent/40 p-4 text-[12px] text-textMuted">
            <p>
              In production, this panel can include risk scores, on-chain
              analytics, dispute history and client feedback. For now, it
              illustrates where VCC&apos;s verification insights will live.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

