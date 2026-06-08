"use client";

import { useState } from "react";
import { submitScamReport } from "./actions";

type ReportType = "wallet" | "project" | "twitter";

export default function ReportPage() {
  const [reportType, setReportType] = useState<ReportType>("wallet");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await submitScamReport(new FormData(e.currentTarget));
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setPending(false);
    }
  }

  const tabs: { value: ReportType; label: string }[] = [
    { value: "wallet", label: "Wallet" },
    { value: "project", label: "Project" },
    { value: "twitter", label: "X Account" },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Report a Scam</h1>
        <p className="mt-2 text-vampTextMuted text-sm">
          Submit a suspicious wallet, project, or X/Twitter account for manual admin review.
          All reports are kept confidential and reviewed before any action is taken.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-green-400">
          <div className="font-semibold text-lg">Report submitted</div>
          <p className="mt-1 text-sm">
            Thank you. Our team will review this report and take appropriate action.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-vampBorder overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setReportType(tab.value)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  reportType === tab.value
                    ? "bg-vampAccent text-white"
                    : "bg-black/40 text-vampTextMuted hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input type="hidden" name="reportType" value={reportType} />

          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 space-y-4">
            {reportType === "wallet" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                    Wallet Address *
                  </label>
                  <input
                    name="walletAddress"
                    required
                    placeholder="e.g. 7xKXt…"
                    className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                    Chain
                  </label>
                  <select
                    name="chain"
                    className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-vampAccent"
                  >
                    <option value="solana">Solana</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="base">Base</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {reportType === "project" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                      Contract Address (CA) *
                    </label>
                    <input
                      name="contractAddress"
                      required
                      placeholder="e.g. 7xKXt…"
                      className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                      Chain
                    </label>
                    <select
                      name="chain"
                      className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-vampAccent"
                    >
                      <option value="solana">Solana</option>
                      <option value="ethereum">Ethereum</option>
                      <option value="base">Base</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                    Project Name *
                  </label>
                  <input
                    name="projectName"
                    required
                    placeholder="e.g. FakeSwap Protocol"
                    className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                  />
                </div>
              </>
            )}

            {reportType === "twitter" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                  X (Twitter) Handle *
                </label>
                <input
                  name="twitterHandle"
                  required
                  placeholder="@scammer or scammer (without @)"
                  className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                />
                <p className="text-xs text-vampTextMuted mt-1">
                  The X/Twitter handle of the account engaging in scam activity.
                </p>
              </div>
            )}

            {/* Project name for wallet reports is optional */}
            {reportType === "wallet" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                  Project Name (optional)
                </label>
                <input
                  name="projectName"
                  placeholder="e.g. FakeSwap Protocol"
                  className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                Description *
              </label>
              <textarea
                name="description"
                required
                minLength={20}
                rows={4}
                placeholder="Describe the suspicious activity in detail…"
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                Evidence Links (one per line)
              </label>
              <textarea
                name="evidenceLinks"
                rows={3}
                placeholder={"https://solscan.io/tx/…\nhttps://twitter.com/…"}
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-vampAccent px-6 py-2.5 text-sm font-medium text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors disabled:opacity-50"
          >
            {pending
              ? "Submitting…"
              : reportType === "project"
              ? "Submit Project Report"
              : reportType === "twitter"
              ? "Submit X Account Report"
              : "Submit Wallet Report"}
          </button>
        </form>
      )}
    </div>
  );
}
