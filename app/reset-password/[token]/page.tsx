"use client";

import { useActionState } from "react";
import { use } from "react";
import { resetPassword, ResetPasswordState } from "./actions";
import Link from "next/link";

const initial: ResetPasswordState = { ok: false, error: "" };

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const boundAction = resetPassword.bind(null, token);
  const [state, action, pending] = useActionState(boundAction, initial);

  if (state.ok) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Password updated</h1>
        <p className="text-blistTextMuted">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/member"
          className="inline-flex items-center justify-center rounded-full bg-blistAccent px-5 py-2.5 text-white shadow-blistGlow hover:bg-blistAccentSoft transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Set new password</h1>
        <p className="mt-2 text-blistTextMuted">Choose a new password for your account.</p>
      </div>

      <form action={action} className="rounded-2xl border border-blistBorder bg-black/40 p-5 space-y-4">
        {state.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {state.error}
            {state.error.includes("expired") && (
              <span>
                {" "}
                <Link href="/forgot-password" className="underline">
                  Request a new link.
                </Link>
              </span>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">New Password</label>
          <input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            className="w-full rounded-xl bg-white/5 border border-blistBorder px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
          <input
            name="confirm"
            type="password"
            placeholder="Repeat your new password"
            className="w-full rounded-xl bg-white/5 border border-blistBorder px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-blistAccent px-5 py-3 text-white shadow-blistGlow hover:bg-blistAccentSoft transition-colors font-medium disabled:opacity-50"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
