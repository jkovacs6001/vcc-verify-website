import Link from "next/link";
import type { Professional } from "../lib/mockData";

interface Props {
  professional: Professional;
}

const statusStyles: Record<
  Professional["status"],
  { label: string; className: string }
> = {
  Verified: {
    label: "Verified by VCC",
    className:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40",
  },
  Pending: {
    label: "Verification pending",
    className: "bg-amber-500/10 text-amber-300 border border-amber-400/40",
  },
};

export const ProfessionalCard: React.FC<Props> = ({ professional }) => {
  const status = statusStyles[professional.status];

  return (
    <div className="card-hover bg-vampSurface/90 border border-vampBorder rounded-2xl px-5 py-4 shadow-lg shadow-black/20">

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {professional.name}
              {professional.alias && (
                <span className="ml-1 text-xs text-vampTextMuted">
                  · @{professional.alias}
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-vampTextMuted mt-1">
            {professional.role}
            {professional.region && ` · ${professional.region}`}
          </p>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {professional.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-vampTextMuted"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-[11px] text-vampTextMuted">
        <span className="font-medium text-[11px] text-white">
          Recent projects:
        </span>{" "}
        {professional.projects.map((p, idx) => (
          <span key={p.name}>
            {p.name}
            {idx < professional.projects.length - 1 && ", "}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-1 text-xs">
        {professional.twitter && (
          <a
            href={professional.twitter}
            target="_blank"
            className="cursor-paw-pointer px-2 py-1 rounded-full bg-white/5 hover:bg-vampAccent/20 text-vampTextMuted hover:text-white"
          >
            Twitter / X
          </a>
        )}
        {professional.telegram && (
          <a
            href={professional.telegram}
            target="_blank"
            className="cursor-paw-pointer px-2 py-1 rounded-full bg-white/5 hover:bg-vampAccent/20 text-vampTextMuted hover:text-white"
          >
            Telegram
          </a>
        )}
        {professional.website && (
          <a
            href={professional.website}
            target="_blank"
            className="cursor-paw-pointer px-2 py-1 rounded-full bg-white/5 hover:bg-vampAccent/20 text-vampTextMuted hover:text-white"
          >
            Website
          </a>
        )}
        <span className="px-2 py-1 rounded-full bg-white/5 text-[10px] text-vampTextMuted truncate max-w-[180px]">
          Wallet: {professional.wallet.slice(0, 5)}…
          {professional.wallet.slice(-5)}
        </span>
      </div>

      <div className="flex justify-between items-center mt-1">
        <Link
          href={`/directory/${professional.id}`}
          className="cursor-paw-pointer text-xs text-vampAccent hover:text-vampAccentSoft"
        >
          View profile →
        </Link>
        {professional.verifiedAt && (
          <span className="text-[10px] text-vampTextMuted">
            Verified: {professional.verifiedAt}
          </span>
        )}
      </div>
    </div>
  );
};

