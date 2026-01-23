"use client";

import { useState } from "react";
import Link from "next/link";

export default function MemberPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotFound(false);
    
    try {
      // TODO: Fetch member's applications by email
      // For now, just show a message
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">My Applications</h1>
        <p className="mt-2 text-vampTextMuted">
          View and track your verification applications.
        </p>
      </div>

      {/* Role-based quick links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/review"
          className="inline-flex items-center justify-center rounded-full bg-blue-600/80 px-5 py-2.5 text-white shadow-vampGlow hover:bg-blue-700 transition-colors text-sm"
        >
          Review Applications
        </Link>
        <Link
          href="/approve"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600/80 px-5 py-2.5 text-white shadow-vampGlow hover:bg-emerald-700 transition-colors text-sm"
        >
          Approvals
        </Link>
      </div>

      <form onSubmit={handleSearch} className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Enter your email
          </label>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-vampAccent px-6 py-3 text-white shadow-vampGlow hover:bg-vampAccentSoft disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {notFound && (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted">
          <p className="mb-4">No applications found for this email.</p>
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
          >
            Submit an application
          </Link>
        </div>
      )}
    </div>
  );
}
