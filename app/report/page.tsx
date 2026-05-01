"use client";

import { useState } from "react";
import { submitScamReport } from "./actions";

export default function ReportPage() {
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

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Report a Scam</h1>
        <p className="mt-2 text-vampTextMuted text-sm">
          Submit suspicious wallets or projects for manual admin review. All reports are
          kept confidential and reviewed before any action is taken.
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
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                  Wallet Address *
                </label>
                <input
                  name="walletAddress"
                  required
                  placeholder="e.g. 7xKXt..."
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
                Project Name (optional)
              </label>
              <input
                name="projectName"
                placeholder="e.g. FakeSwap Protocol"
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                Description *
              </label>
              <textarea
                name="description"
                required
                minLength={20}
                rows={4}
                placeholder="Describe the suspicious activity in detail..."
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
                placeholder={"https://solscan.io/tx/...\nhttps://twitter.com/..."}
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
            {pending ? "Submitting…" : "Submit Report"}
          </button>
        </form>
      )}
    </div>
  );
}
