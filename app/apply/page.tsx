"use client";

import { useState } from "react";

const roles = [
  "Developer",
  "Marketer",
  "Market Maker",
  "Moderator",
  "Web3 Worker",
];

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, just flip a flag. Later: send to API / DB.
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Apply for Verification</h1>
        <p className="text-sm text-textMuted">
          If you&apos;re a Web3 professional serving token projects, launchpads
          or communities, you can apply to be listed in the VCC Verification
          Directory. For this demo, this form is local only and demonstrates the
          future onboarding flow.
        </p>
      </header>

      <div className="rounded-2xl bg-surface border border-white/10 p-5">
        {submitted ? (
          <div className="space-y-3 text-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/50 text-xs">
              <span>✅</span>
              Application captured (demo)
            </div>
            <p className="text-textMuted">
              In the live system, your information would now be reviewed by the
              VCC verification team. You&apos;d receive a confirmation message
              and a payment request in VCC tokens to finalize your listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-textMuted">Name / studio</label>
                <input
                  required
                  className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="e.g., Astra Labs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-textMuted">
                  Public alias / handle
                </label>
                <input
                  className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="@astra_dev"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-textMuted">Role</label>
                <select
                  required
                  className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 cursor-paw-pointer outline-none focus:ring-2 focus:ring-accent/60"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select your primary role
                  </option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-textMuted">Region (optional)</label>
                <input
                  className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="e.g., EU, US, Asia"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-textMuted">Twitter / X</label>
                <input
                  className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-textMuted">Telegram</label>
                <input
                  className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-textMuted">
                Primary wallet for payments and on-chain history
              </label>
              <input
                required
                className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60 font-mono text-xs"
                placeholder="Enter your public wallet address"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-textMuted">
                Briefly list 2–3 projects you&apos;ve worked on
              </label>
              <textarea
                required
                rows={3}
                className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60 text-sm"
                placeholder="- Project A: role & link
- Project B: role & link"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-textMuted">
                References (Telegram / X of founders who can vouch for you)
              </label>
              <textarea
                rows={2}
                className="w-full bg-surfaceSoft border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/60 text-sm"
                placeholder="@founder1, @founder2"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-textMuted max-w-xs">
                In production, submitting this form will trigger a verification
                workflow and a payment request in VCC tokens for the review
                process.
              </p>
              <button
                type="submit"
                className="cursor-paw-pointer inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-accent text-sm font-medium shadow-glow hover:bg-accent/90"
              >
                Submit application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

