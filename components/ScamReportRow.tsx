"use client";

import { useState } from "react";
import { reviewScamReport } from "@/app/admin/actions";

interface ScamReport {
  id: string;
  walletAddress: string;
  chain: string;
  projectName: string | null;
  description: string;
  evidenceLinks: string[];
  status: string;
  adminNote: string | null;
  createdAt: Date;
}

export function ScamReportRow({ report }: { report: ScamReport }) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function handle(status: "REVIEWED" | "CONFIRMED" | "DISMISSED") {
    setPending(true);
    try {
      await reviewScamReport(report.id, status, note);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-vampBorder bg-black/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-sm text-white break-all">
            {report.walletAddress}
            <span className="ml-2 text-xs text-vampTextMuted capitalize">({report.chain})</span>
          </div>
          {report.projectName && (
            <div className="mt-0.5 text-sm text-vampTextMuted">Project: {report.projectName}</div>
          )}
        </div>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
          {report.status}
        </span>
      </div>

      <p className="text-sm text-white/80">{report.description}</p>

      {report.evidenceLinks.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-vampTextMuted font-medium">Evidence</div>
          {report.evidenceLinks.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-vampAccent hover:underline break-all"
            >
              {link}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Admin note (optional)"
          className="flex-1 rounded-xl border border-vampBorder bg-black/60 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
        />
        <button
          onClick={() => handle("CONFIRMED")}
          disabled={pending}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          onClick={() => handle("DISMISSED")}
          disabled={pending}
          className="rounded-full border border-vampBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
