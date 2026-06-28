"use client";

import { useState } from "react";
import {
  editBlacklistedWallet,
  deleteBlacklistedWallet,
  editScamReport,
  removeConfirmedReport,
} from "@/app/admin/actions";

// ── Blacklisted Wallet ────────────────────────────────────────────

interface WalletEntry {
  id: string;
  walletAddress: string;
  chain: string;
  reason: string;
  confirmedAt: Date;
}

export function BlacklistedWalletRow({ entry }: { entry: WalletEntry }) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(entry.walletAddress);
  const [chain, setChain] = useState(entry.chain);
  const [reason, setReason] = useState(entry.reason);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-blistBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent";

  async function handleSave() {
    setSaving(true);
    try {
      await editBlacklistedWallet(entry.id, { walletAddress: address, chain, reason });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteBlacklistedWallet(entry.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blistBorder bg-black/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium text-blue-400 border-blue-400/40 bg-blue-400/10">
              Wallet
            </span>
            <span className="text-xs text-blistTextMuted capitalize">{entry.chain}</span>
          </div>
          {!editing && (
            <div className="font-mono text-sm text-white/80 break-all">{entry.walletAddress}</div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            Blacklisted
          </span>
          <button
            onClick={() => { setEditing((v) => !v); setConfirmDelete(false); }}
            className="text-xs px-2 py-0.5 rounded-full border border-blistBorder bg-white/5 text-blistTextMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {!editing && <p className="text-sm text-white/70">{entry.reason}</p>}

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">Wallet Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">Chain</label>
            <select value={chain} onChange={(e) => setChain(e.target.value)} className={inputClass}>
              <option value="solana">Solana</option>
              <option value="ethereum">Ethereum</option>
              <option value="base">Base</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-blistAccent px-3 py-1.5 text-xs font-medium text-white hover:bg-blistAccentSoft disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-blistBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <div className="ml-auto">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Remove from blacklist?</span>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {saving ? "Removing…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full border border-blistBorder bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-blistTextMuted">
          Confirmed {new Date(entry.confirmedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// ── Confirmed Scam Report (project / twitter / wallet) ───────────

interface ReportEntry {
  id: string;
  reportType: string;
  walletAddress: string | null;
  contractAddress: string | null;
  twitterHandle: string | null;
  projectName: string | null;
  chain: string;
  description: string;
  evidenceLinks: string[];
  reviewedAt: Date | null;
}

export function ConfirmedReportRow({ entry }: { entry: ReportEntry }) {
  const isProject = entry.reportType === "project";
  const isTwitter = entry.reportType === "twitter";

  const currentAddress = isProject
    ? (entry.contractAddress ?? "")
    : isTwitter
    ? (entry.twitterHandle ?? "")
    : (entry.walletAddress ?? "");

  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(currentAddress);
  const [projectName, setProjectName] = useState(entry.projectName ?? "");
  const [chain, setChain] = useState(entry.chain);
  const [description, setDescription] = useState(entry.description);
  const [evidence, setEvidence] = useState(entry.evidenceLinks.join("\n"));
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-blistBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent";

  async function handleSave() {
    setSaving(true);
    try {
      await editScamReport(entry.id, {
        description,
        projectName: projectName || null,
        address,
        chain,
        evidenceLinks: evidence.split("\n").map((l) => l.trim()).filter(Boolean),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await removeConfirmedReport(entry.id);
    } finally {
      setSaving(false);
    }
  }

  const typeBadge = isProject
    ? { label: "Project", color: "text-purple-400 border-purple-400/40 bg-purple-400/10" }
    : isTwitter
    ? { label: "X Account", color: "text-sky-400 border-sky-400/40 bg-sky-400/10" }
    : { label: "Wallet", color: "text-blue-400 border-blue-400/40 bg-blue-400/10" };

  return (
    <div className="rounded-2xl border border-blistBorder bg-black/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${typeBadge.color}`}>
              {typeBadge.label}
            </span>
            {entry.projectName && !editing && (
              <span className="text-sm font-semibold text-white">{entry.projectName}</span>
            )}
          </div>
          {!editing && (
            <div className="font-mono text-sm text-white/70 break-all">
              {isTwitter ? "@" : isProject ? "CA: " : ""}{currentAddress}
              {!isTwitter && <span className="ml-2 text-xs text-blistTextMuted capitalize">({entry.chain})</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            Confirmed
          </span>
          <button
            onClick={() => { setEditing((v) => !v); setConfirmRemove(false); }}
            className="text-xs px-2 py-0.5 rounded-full border border-blistBorder bg-white/5 text-blistTextMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {!editing && <p className="text-sm text-white/70">{entry.description}</p>}

      {editing ? (
        <div className="space-y-3">
          {(isProject || isTwitter) && (
            <div>
              <label className="block text-xs text-blistTextMuted mb-1">
                {isProject ? "Project Name" : "Handle / Name"}
              </label>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputClass} />
            </div>
          )}
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">
              {isProject ? "Contract Address" : isTwitter ? "X Handle" : "Wallet Address"}
            </label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          {!isTwitter && (
            <div>
              <label className="block text-xs text-blistTextMuted mb-1">Chain</label>
              <select value={chain} onChange={(e) => setChain(e.target.value)} className={inputClass}>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className="block text-xs text-blistTextMuted mb-1">Evidence Links (one per line)</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-blistAccent px-3 py-1.5 text-xs font-medium text-white hover:bg-blistAccentSoft disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-blistBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <div className="ml-auto">
              {confirmRemove ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Remove from blacklist?</span>
                  <button
                    onClick={handleRemove}
                    disabled={saving}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {saving ? "Removing…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmRemove(false)}
                    className="rounded-full border border-blistBorder bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRemove(true)}
                  className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-blistTextMuted">
          Confirmed {entry.reviewedAt ? new Date(entry.reviewedAt).toLocaleDateString() : "—"}
        </div>
      )}
    </div>
  );
}
