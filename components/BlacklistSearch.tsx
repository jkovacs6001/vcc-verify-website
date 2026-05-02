"use client";

import { useState, useMemo } from "react";

interface BlacklistedWallet {
  id: string;
  walletAddress: string;
  chain: string;
  reason: string;
  confirmedAt: Date;
}

interface ConfirmedProject {
  id: string;
  projectName: string | null;
  contractAddress: string | null;
  chain: string;
  description: string;
  reviewedAt: Date | null;
}

interface Props {
  wallets: BlacklistedWallet[];
  projects: ConfirmedProject[];
}

export function BlacklistSearch({ wallets, projects }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "wallets" | "projects">("all");

  const q = query.trim().toLowerCase();

  const filteredWallets = useMemo(() =>
    q ? wallets.filter((e) => e.walletAddress.toLowerCase().includes(q)) : wallets,
    [q, wallets]
  );

  const filteredProjects = useMemo(() =>
    q ? projects.filter((p) =>
      (p.contractAddress?.toLowerCase().includes(q)) ||
      (p.projectName?.toLowerCase().includes(q))
    ) : projects,
    [q, projects]
  );

  const showWallets = tab === "all" || tab === "wallets";
  const showProjects = tab === "all" || tab === "projects";

  const exactWalletMatch = q && filteredWallets.some(
    (e) => e.walletAddress.toLowerCase() === q
  );
  const exactProjectMatch = q && filteredProjects.some(
    (p) => p.contractAddress?.toLowerCase() === q
  );
  const anyExactMatch = exactWalletMatch || exactProjectMatch;
  const totalResults = (showWallets ? filteredWallets.length : 0) + (showProjects ? filteredProjects.length : 0);
  const totalEntries = wallets.length + projects.length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by wallet address, CA, or project name…"
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

      {/* Tab filter */}
      <div className="flex gap-2">
        {(["all", "wallets", "projects"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              tab === t
                ? "bg-vampAccent/20 border-vampAccent text-white"
                : "border-vampBorder text-vampTextMuted hover:text-white bg-black/40"
            }`}
          >
            {t === "all" ? `All (${totalEntries})` : t === "wallets" ? `Wallets (${wallets.length})` : `Projects (${projects.length})`}
          </button>
        ))}
      </div>

      {q && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
          anyExactMatch
            ? "border-red-500/40 bg-red-500/10 text-red-400"
            : "border-green-500/30 bg-green-500/10 text-green-400"
        }`}>
          {anyExactMatch
            ? `⚠ This address is on the blacklist${exactProjectMatch ? " (scam project)" : ""}.`
            : totalResults > 0
            ? `${totalResults} partial match${totalResults !== 1 ? "es" : ""} found.`
            : "✓ This address was not found in the blacklist."}
        </div>
      )}

      {totalEntries === 0 ? (
        <div className="rounded-2xl border border-vampBorder bg-black/40 p-6 text-vampTextMuted text-sm">
          No blacklisted entries yet.
        </div>
      ) : (
        <div className="space-y-2">
          {showWallets && filteredWallets.map((e) => (
            <div key={e.id} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium text-blue-400 border-blue-400/40 bg-blue-400/10">
                      Wallet
                    </span>
                  </div>
                  <div className="font-mono text-sm text-white break-all">{e.walletAddress}</div>
                  <div className="mt-0.5 text-xs text-vampTextMuted capitalize">Chain: {e.chain}</div>
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

          {showProjects && filteredProjects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium text-purple-400 border-purple-400/40 bg-purple-400/10">
                      Project
                    </span>
                    {p.projectName && (
                      <span className="text-sm font-semibold text-white">{p.projectName}</span>
                    )}
                  </div>
                  {p.contractAddress && (
                    <div className="font-mono text-sm text-white/70 break-all">CA: {p.contractAddress}</div>
                  )}
                  <div className="mt-0.5 text-xs text-vampTextMuted capitalize">Chain: {p.chain}</div>
                </div>
                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  Confirmed Scam
                </span>
              </div>
              <p className="mt-2 text-sm text-white/80">{p.description}</p>
              {p.reviewedAt && (
                <div className="mt-2 text-xs text-vampTextMuted">
                  Confirmed {new Date(p.reviewedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-vampTextMuted">
        {totalEntries} entr{totalEntries !== 1 ? "ies" : "y"} on the blacklist ·{" "}
        <a href="/report" className="text-vampAccent hover:underline">
          Report a scam
        </a>
      </div>
    </div>
  );
}
