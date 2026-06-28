"use client";

import { useState } from "react";
import { reviewScamReport, editScamReport } from "@/app/admin/actions";

interface ScamReport {
  id: string;
  reportType: string;
  walletAddress: string | null;
  contractAddress: string | null;
  twitterHandle: string | null;
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
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [editDescription, setEditDescription] = useState(report.description);
  const [editProjectName, setEditProjectName] = useState(report.projectName ?? "");
  const [editAddress, setEditAddress] = useState(
    report.reportType === "project"
      ? (report.contractAddress ?? "")
      : report.reportType === "twitter"
      ? (report.twitterHandle ?? "")
      : (report.walletAddress ?? "")
  );
  const [editChain, setEditChain] = useState(report.chain);
  const [editEvidence, setEditEvidence] = useState(report.evidenceLinks.join("\n"));
  const [editSaving, setEditSaving] = useState(false);

  async function handle(status: "REVIEWED" | "CONFIRMED" | "DISMISSED") {
    setPending(true);
    try {
      await reviewScamReport(report.id, status, note);
    } finally {
      setPending(false);
    }
  }

  async function handleSaveEdit() {
    setEditSaving(true);
    try {
      await editScamReport(report.id, {
        description: editDescription,
        projectName: editProjectName || null,
        address: editAddress,
        chain: editChain,
        evidenceLinks: editEvidence.split("\n").map((l) => l.trim()).filter(Boolean),
      });
      setEditing(false);
    } finally {
      setEditSaving(false);
    }
  }

  const isProject = report.reportType === "project";
  const isTwitter = report.reportType === "twitter";
  const isWallet = !isProject && !isTwitter;

  const currentAddress = isProject
    ? report.contractAddress
    : isTwitter
    ? report.twitterHandle
    : report.walletAddress;

  const inputClass = "w-full rounded-xl border border-blistBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent";

  return (
    <div className="rounded-2xl border border-blistBorder bg-black/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
              isProject
                ? "text-purple-400 border-purple-400/40 bg-purple-400/10"
                : isTwitter
                ? "text-sky-400 border-sky-400/40 bg-sky-400/10"
                : "text-blue-400 border-blue-400/40 bg-blue-400/10"
            }`}>
              {isProject ? "Project" : isTwitter ? "X/Twitter" : "Wallet"}
            </span>
            {report.projectName && !editing && (
              <span className="text-sm font-semibold text-white">{report.projectName}</span>
            )}
          </div>
          {!editing && (
            <div className="mt-1 font-mono text-sm text-white/70 break-all">
              {isProject ? "CA: " : isTwitter ? "@" : ""}{currentAddress}
              {!isTwitter && <span className="ml-2 text-xs text-blistTextMuted capitalize">({report.chain})</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            {report.status}
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-xs px-2 py-0.5 rounded-full border border-blistBorder bg-white/5 text-blistTextMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          {(isProject || isTwitter) && (
            <div>
              <label className="block text-xs text-blistTextMuted mb-1">
                {isProject ? "Project Name" : "Handle / Name"}
              </label>
              <input
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">
              {isProject ? "Contract Address" : isTwitter ? "X/Twitter Handle" : "Wallet Address"}
            </label>
            <input
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className={inputClass}
            />
          </div>
          {!isTwitter && (
            <div>
              <label className="block text-xs text-blistTextMuted mb-1">Chain</label>
              <select
                value={editChain}
                onChange={(e) => setEditChain(e.target.value)}
                className={inputClass}
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="base">Base</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">Evidence Links (one per line)</label>
            <textarea
              value={editEvidence}
              onChange={(e) => setEditEvidence(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={editSaving}
              className="rounded-full bg-blistAccent px-3 py-1.5 text-xs font-medium text-white hover:bg-blistAccentSoft disabled:opacity-50"
            >
              {editSaving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-blistBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-white/80">{report.description}</p>

          {report.evidenceLinks.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-blistTextMuted font-medium">Evidence</div>
              {report.evidenceLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blistAccent hover:underline break-all"
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
              className="flex-1 rounded-xl border border-blistBorder bg-black/60 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent"
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
              className="rounded-full border border-blistBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </>
      )}
    </div>
  );
}
