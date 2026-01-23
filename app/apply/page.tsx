"use client";

import React, { useActionState } from "react";
import { submitApplication } from "./actions";
import type { ApplyState } from "./actions";

export default function ApplyPage() {
  const [state, formAction] = useActionState(submitApplication, { ok: false } as ApplyState);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Apply to get verified</h1>
        <p className="mt-2 text-vampTextMuted">
          Submit your info and references. Applications are manually reviewed.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Honeypot */}
        <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />

        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basics</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="displayName" placeholder="Display name *" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="handle" placeholder="Handle (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="role" placeholder="Role * (Dev, Designer, PM...)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="location" placeholder="Location (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>

          <textarea name="bio" placeholder="Short bio (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white min-h-[110px]" />

          <div className="grid gap-4 md:grid-cols-2">
            <input name="skillsCsv" placeholder="Skills (comma-separated)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="tagsCsv" placeholder="Tags (comma-separated)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>
        </section>

        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Contact</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="email" placeholder="Email *" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="telegram" placeholder="Telegram (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="xHandle" placeholder="X handle (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="website" placeholder="Website (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="github" placeholder="GitHub (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="linkedin" placeholder="LinkedIn (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>
        </section>

        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Web3</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="chain" defaultValue="solana" placeholder="Chain (default: solana)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <input name="wallet" placeholder="Wallet address (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
          </div>
        </section>

        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-5">
          <h2 className="text-lg font-semibold text-white">References (up to 3)</h2>

          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-vampBorder/60 bg-black/30 p-4 space-y-3">
              <div className="text-sm font-semibold text-white">Reference {i + 1}</div>
              <div className="grid gap-3 md:grid-cols-2">
                <input name={`ref_${i}_name`} placeholder="Name" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
                <input name={`ref_${i}_relationship`} placeholder="Relationship (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input name={`ref_${i}_contact`} placeholder="Contact (email/telegram) (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
                <input name={`ref_${i}_link`} placeholder="Link (project/tweet/github) (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              </div>
              <textarea name={`ref_${i}_notes`} placeholder="Notes (optional)" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white min-h-[90px]" />
            </div>
          ))}
        </section>

        <div className="flex items-center gap-3">
          <button className="rounded-full bg-vampAccent px-6 py-2.5 text-white shadow-vampGlow">
            Submit application
          </button>

          {state?.ok && (
            <span className="text-emerald-300">Submitted. Pending review.</span>
          )}
          {state?.ok === false && state?.error && (
            <span className="text-red-300">{state.error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
