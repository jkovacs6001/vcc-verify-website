"use client";

import { useState } from "react";
import { recalculateAllTrustScores } from "@/app/admin/actions";

export function RecalculateScoresButton() {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [count, setCount] = useState(0);

  async function handle() {
    setState("running");
    try {
      const n = await recalculateAllTrustScores();
      setCount(n);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      onClick={handle}
      disabled={state === "running"}
      className="rounded-full border border-blistAccent/40 bg-blistAccent/10 px-4 py-2 text-sm font-medium text-blistAccent hover:bg-blistAccent/20 transition-colors disabled:opacity-50"
    >
      {state === "running"
        ? "Recalculating…"
        : state === "done"
        ? `✓ Updated ${count} profile${count !== 1 ? "s" : ""}`
        : "Recalculate all trust scores"}
    </button>
  );
}
