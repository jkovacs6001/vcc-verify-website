"use client";

import { useActionState } from "react";
import { requestPasswordReset, ForgotPasswordState } from "./actions";
import Link from "next/link";

const initial: ForgotPasswordState = { ok: false, error: "" };

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.ok) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Check your email</h1>
        <p className="text-blistTextMuted">
          If an account exists for that address, we've sent a password reset link. It expires in 1 hour.
        </p>
        <Link
          href="/member"
          className="inline-flex items-center justify-center rounded-full bg-blistAccent px-5 py-2.5 text-white shadow-blistGlow hover:bg-blistAccentSoft transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Forgot password</h1>
        <p className="mt-2 text-blistTextMuted">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form action={action} className="rounded-2xl border border-blistBorder bg-black/40 p-5 space-y-4">
        {state.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="your@email.com"
            className="w-full rounded-xl bg-white/5 border border-blistBorder px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-blistAccent px-5 py-3 text-white shadow-blistGlow hover:bg-blistAccentSoft transition-colors font-medium disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <div className="text-center text-sm text-blistTextMuted">
        Remembered it?{" "}
        <Link href="/member" className="text-blistAccent hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
