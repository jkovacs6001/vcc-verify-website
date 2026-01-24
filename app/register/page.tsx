"use client";

import { useActionState } from "react";
import { registerAccount, type RegisterState } from "./actions";
import Link from "next/link";

const initialState: RegisterState = { ok: false, error: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAccount,
    initialState
  );

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Create Account</h1>
        <p className="mt-2 text-vampTextMuted">
          Join the VCC network. Register to access member features and optionally apply for verification later.
        </p>
      </div>

      <form action={formAction} className="rounded-2xl border border-vampBorder bg-black/40 p-6 space-y-5">
        {state && !state.ok && state.error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Display Name *
          </label>
          <input
            name="displayName"
            type="text"
            placeholder="Your name"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 border border-white/10 focus:border-vampAccent focus:outline-none transition-colors"
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email Address *
          </label>
          <input
            name="email"
            type="email"
            placeholder="your@email.com"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 border border-white/10 focus:border-vampAccent focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Password *
          </label>
          <input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 border border-white/10 focus:border-vampAccent focus:outline-none transition-colors"
            required
            minLength={8}
          />
          <p className="mt-1.5 text-xs text-vampTextMuted">
            Must be at least 8 characters long
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-vampAccent px-6 py-3 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center text-sm text-vampTextMuted">
        Already have an account?{" "}
        <Link href="/member" className="text-vampAccent hover:underline">
          Sign in
        </Link>
      </div>

      <div className="rounded-xl border border-vampBorder bg-black/30 p-4">
        <p className="text-sm text-vampTextMuted">
          <strong className="text-white">Note:</strong> Creating an account gives you access to member features. 
          If you want to be listed in the verified directory, you can apply for verification after registration.
        </p>
      </div>
    </div>
  );
}
