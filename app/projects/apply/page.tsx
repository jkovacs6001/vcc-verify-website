"use client";

import { useState } from "react";
import { submitProjectApplication } from "../actions";

export default function ProjectApplyPage() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await submitProjectApplication(new FormData(e.currentTarget));
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
        <h1 className="text-3xl font-semibold text-white">Apply for Project Verification</h1>
        <p className="mt-2 text-vampTextMuted text-sm">
          Get your crypto project reviewed and listed in the VCC verified projects directory.
          Applications are manually reviewed by the VCC team.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-green-400">
          <div className="font-semibold text-lg">Application submitted</div>
          <p className="mt-1 text-sm">
            Our team will review your project and contact you via the provided team contact.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                Project Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. VampCatSwap"
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                  Contract Address
                </label>
                <input
                  name="contractAddress"
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
                Website
              </label>
              <input
                name="website"
                type="url"
                placeholder="https://yourproject.xyz"
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
                minLength={30}
                rows={4}
                placeholder="What does your project do? What problem does it solve?"
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                Team Contact (email / telegram) *
              </label>
              <input
                name="teamContact"
                required
                placeholder="email@example.com or @handle"
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                  Twitter / X
                </label>
                <input
                  name="twitterHandle"
                  placeholder="@handle"
                  className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                  Telegram
                </label>
                <input
                  name="telegramHandle"
                  placeholder="@handle or t.me/..."
                  className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-vampTextMuted uppercase tracking-wide">
                GitHub
              </label>
              <input
                name="githubUrl"
                placeholder="https://github.com/yourorg/repo"
                className="w-full rounded-xl border border-vampBorder bg-black/60 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
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
            {pending ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      )}
    </div>
  );
}
