import React from "react";
import Link from "next/link";
import type { Professional } from "../lib/mockData";

interface Props {
  professional: Professional;
}

export const ProfessionalCard: React.FC<Props> = ({ professional }) => {
  const status = professional.status === "Verified"
    ? { label: "Verified by VampCatCoin", className: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30" }
    : { label: "Pending review", className: "bg-amber-500/15 text-amber-300 border border-amber-400/40" };

  // safe wallet preview (handle null and short strings)
  const walletPreview = (() => {
    const w = professional.wallet ?? "";
    if (!w) return "Not provided";
    if (w.length <= 10) return w;
    return `${w.slice(0, 5)}…${w.slice(-5)}`;
  })();

  return (
    <div className="rounded-2xl border border-vampBorder bg-black/40 p-4">
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

      <div className="flex flex-wrap gap-1.5 mt-3">
        {professional.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-vampTextMuted"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-[11px] text-vampTextMuted mt-3">
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

      <div className="flex flex-wrap gap-2 mt-3 text-xs items-center">
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
          Wallet: {walletPreview}
        </span>
      </div>

      <div className="flex justify-between items-center mt-3">
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
