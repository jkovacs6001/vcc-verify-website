"use client";

import { useState } from "react";
import { reviewProject } from "@/app/admin/actions";

interface Project {
  id: string;
  name: string;
  website: string | null;
  contractAddress: string | null;
  chain: string;
  description: string;
  teamContact: string;
  twitterHandle: string | null;
  telegramHandle: string | null;
  githubUrl: string | null;
  status: string;
  createdAt: Date;
}

export function ProjectReviewRow({ project }: { project: Project }) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function handle(status: "APPROVED" | "REJECTED") {
    setPending(true);
    try {
      await reviewProject(project.id, status, note);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-vampBorder bg-black/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-white text-lg">{project.name}</div>
          <div className="text-xs text-vampTextMuted capitalize mt-0.5">
            {project.chain}
            {project.contractAddress && (
              <span className="ml-2 font-mono">{project.contractAddress.slice(0, 10)}…</span>
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
          {project.status}
        </span>
      </div>

      <p className="text-sm text-white/80">{project.description}</p>

      <div className="flex flex-wrap gap-3 text-xs text-vampTextMuted">
        <span>Contact: {project.teamContact}</span>
        {project.website && (
          <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-vampAccent hover:underline">
            Website ↗
          </a>
        )}
        {project.twitterHandle && <span>@{project.twitterHandle}</span>}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-vampAccent hover:underline">
            GitHub ↗
          </a>
        )}
      </div>

      <div className="flex items-end gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Admin note (optional)"
          className="flex-1 rounded-xl border border-vampBorder bg-black/60 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-vampAccent"
        />
        <button
          onClick={() => handle("APPROVED")}
          disabled={pending}
          className="rounded-full bg-vampAccent px-3 py-1.5 text-xs font-medium text-white hover:bg-vampAccentSoft disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handle("REJECTED")}
          disabled={pending}
          className="rounded-full border border-vampBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
