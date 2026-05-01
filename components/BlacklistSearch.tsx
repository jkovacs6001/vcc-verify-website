"use client";

import { useState, useMemo } from "react";

interface BlacklistedWallet {
  id: string;
  walletAddress: string;
  chain: string;
  reason: string;
  confirmedAt: Date;
}

export function BlacklistSearch({ entries }: { entries: BlacklistedWallet[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.walletAddress.toLowerCase().includes(q));
  }, [query, entries]);

  const isMatch = query.trim().length > 0 && filtered.length > 0 &&
    filtered[0].walletAddress.toLowerCase() === query.trim().toLowerCase();

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search wallet address…"
          className="w-full rounded-2xl border border-vampBorder bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-vampTextMuted hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {query.trim() && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            isMatch
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-green-500/30 bg-green-500/10 text-green-400"
          }`}
        >
          {isMatch
            ? "⚠ This wallet is on the blacklist."
            : filtered.length > 0
            ? `${filtered.length} partial match${filtered.length !== 1 ? "es" : ""} found.`
            : "✓ This wallet address was not found in the blacklist."}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted text-sm">
          No blacklisted wallets yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm text-white break-all">
                    {e.walletAddress}
                  </div>
                  <div className="mt-0.5 text-xs text-vampTextMuted capitalize">
                    Chain: {e.chain}
                  </div>
                </div>
                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  Blacklisted
                </span>
              </div>
              <p className="mt-2 text-sm text-white/80">{e.reason}</p>
              <div className="mt-2 text-xs text-vampTextMuted">
                Confirmed {new Date(e.confirmedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-vampTextMuted">
        {entries.length} wallet{entries.length !== 1 ? "s" : ""} on the blacklist ·{" "}
        <a href="/report" className="text-vampAccent hover:underline">
          Report a suspicious wallet
        </a>
      </div>
    </div>
  );
}
