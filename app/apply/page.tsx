"use client";

import React, { useActionState } from "react";
import { submitApplication } from "./actions";
import type { ApplyState } from "./actions";

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-vampTextMuted">{children}</p>;
}

function FieldLabel({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-white/70 mb-1">
      {children}
      {required && <span className="ml-1 text-vampAccent">*</span>}
    </label>
  );
}

export default function ApplyPage() {
  const [state, formAction] = useActionState(submitApplication, { ok: false } as ApplyState);
  const [passwordError, setPasswordError] = React.useState("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value;

    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Apply to get verified</h1>
        <p className="mt-2 text-vampTextMuted">
          Submit your info and verifiable proof of your work. Applications are manually reviewed —
          incomplete or unverifiable submissions will not be approved.
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-300">
        <span className="font-semibold">Required for approval:</span> at least one active social profile
        (X/Twitter or Telegram) and at least one verifiable portfolio/work link.
        Applications missing these will be flagged and may be rejected.
      </div>

      <form action={formAction} onSubmit={handleFormSubmit} className="space-y-6">
        {/* Honeypot */}
        <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />

        {/* Basics */}
        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basics</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>Display Name</FieldLabel>
              <input name="displayName" placeholder="e.g. Alex Carter" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Your public name shown on your verified profile.</FieldHint>
            </div>
            <div>
              <FieldLabel>Handle</FieldLabel>
              <input name="handle" placeholder="e.g. alexcarter" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Short username (no spaces). Optional.</FieldHint>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>Role</FieldLabel>
              <input name="role" placeholder="e.g. Dev, Designer, PM, Artist…" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Your primary role or specialization in the Web3 space.</FieldHint>
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <input name="location" placeholder="e.g. New York, Remote" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>City/country or "Remote". Optional.</FieldHint>
            </div>
          </div>

          <div>
            <FieldLabel>Bio</FieldLabel>
            <textarea name="bio" placeholder="Brief intro — who you are and what you do in Web3…" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white min-h-[110px]" />
            <FieldHint>A short description of your background and experience. Optional but recommended.</FieldHint>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Skills</FieldLabel>
              <input name="skillsCsv" placeholder="e.g. Rust, Solidity, React" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Comma-separated technical skills.</FieldHint>
            </div>
            <div>
              <FieldLabel>Tags</FieldLabel>
              <input name="tagsCsv" placeholder="e.g. DeFi, NFT, Gaming" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Comma-separated industry tags.</FieldHint>
            </div>
          </div>
        </section>

        {/* Account / Contact */}
        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Account & Contact</h2>

          <div>
            <FieldLabel required>Email</FieldLabel>
            <input name="email" type="email" placeholder="you@example.com" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <FieldHint>Used for login and application status notifications.</FieldHint>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>Password</FieldLabel>
              <input name="password" type="password" placeholder="Min. 8 characters" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" minLength={8} />
            </div>
            <div>
              <FieldLabel required>Confirm Password</FieldLabel>
              <input name="confirmPassword" type="password" placeholder="Repeat your password" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" minLength={8} />
            </div>
          </div>

          {passwordError && (
            <div className="text-sm text-red-400">{passwordError}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Telegram Handle</FieldLabel>
              <input name="telegram" placeholder="@yourtelegram" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>
                <span className="text-yellow-400 font-medium">Strongly recommended.</span> Used to reach you and verify identity.
              </FieldHint>
            </div>
            <div>
              <FieldLabel>X (Twitter) Handle</FieldLabel>
              <input name="xHandle" placeholder="@yourxhandle" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>
                <span className="text-yellow-400 font-medium">Strongly recommended.</span> Public profile used for verification.
              </FieldHint>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>GitHub</FieldLabel>
              <input name="github" placeholder="https://github.com/yourprofile" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Link to your GitHub profile. Helpful for devs.</FieldHint>
            </div>
            <div>
              <FieldLabel>LinkedIn</FieldLabel>
              <input name="linkedin" placeholder="https://linkedin.com/in/yourprofile" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Professional profile for additional verification.</FieldHint>
            </div>
          </div>

          <div>
            <FieldLabel>Website</FieldLabel>
            <input name="website" placeholder="https://yourwebsite.com" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
            <FieldHint>Personal site, portfolio, or project page.</FieldHint>
          </div>
        </section>

        {/* Web3 */}
        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Web3</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Chain</FieldLabel>
              <input name="chain" defaultValue="solana" placeholder="solana" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Your primary blockchain (default: Solana).</FieldHint>
            </div>
            <div>
              <FieldLabel>Wallet Address</FieldLabel>
              <input name="wallet" placeholder="Your public wallet address" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
              <FieldHint>Public address only — never share private keys.</FieldHint>
            </div>
          </div>
        </section>

        {/* Proof of Work — important */}
        <section className="rounded-2xl border border-vampAccent/40 bg-vampAccent/5 p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Proof of Work</h2>
            <p className="mt-1 text-sm text-vampTextMuted">
              Provide verifiable links to your prior work. At least one link is required.
              This can be a GitHub repo, a deployed project, a tweet showing your work,
              an Imgur screenshot, a portfolio site, or a link to a project you contributed to.
            </p>
          </div>

          {[0, 1, 2].map((i) => (
            <div key={i}>
              <FieldLabel required={i === 0}>Portfolio / Work Link {i + 1}{i === 0 ? "" : " (optional)"}</FieldLabel>
              <input
                name={`portfolioLink_${i}`}
                placeholder="https://github.com/… or https://imgur.com/… or https://…"
                className="w-full rounded-xl bg-white/5 px-4 py-3 text-white border border-vampBorder focus:border-vampAccent/60 focus:outline-none"
              />
              {i === 0 && <FieldHint>Required. A link to a project, repo, portfolio, or screenshot of your work.</FieldHint>}
            </div>
          ))}
        </section>

        {/* References */}
        <section className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">References (up to 3)</h2>
            <p className="mt-1 text-sm text-vampTextMuted">
              People who can vouch for your work — former colleagues, project leads, or community members.
              References are not required but significantly improve your chances of approval.
            </p>
          </div>

          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-vampBorder/60 bg-black/30 p-4 space-y-3">
              <div className="text-sm font-semibold text-white">Reference {i + 1}</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <input name={`ref_${i}_name`} placeholder="Reference's full name" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
                </div>
                <div>
                  <FieldLabel>Relationship</FieldLabel>
                  <input name={`ref_${i}_relationship`} placeholder="e.g. Project lead, Colleague" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel>Contact</FieldLabel>
                  <input name={`ref_${i}_contact`} placeholder="Email or Telegram" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
                  <FieldHint>How we can reach them to verify.</FieldHint>
                </div>
                <div>
                  <FieldLabel>Link</FieldLabel>
                  <input name={`ref_${i}_link`} placeholder="Project, tweet, or GitHub link" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white" />
                </div>
              </div>
              <div>
                <FieldLabel>Notes</FieldLabel>
                <textarea name={`ref_${i}_notes`} placeholder="Context about how you worked together…" className="w-full rounded-xl bg-white/5 px-4 py-3 text-white min-h-[90px]" />
              </div>
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
