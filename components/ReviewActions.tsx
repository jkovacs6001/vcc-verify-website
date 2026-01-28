"use client";

import { useState } from "react";
import { markReadyForApproval, rejectAfterReview } from "@/app/review/actions";

export function ReviewActions({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  async function handleMarkReady() {
    if (loading) return;
    setLoading(true);
    try {
      await markReadyForApproval(profileId, note.trim() || undefined);
      setNote("");
      setShowNoteInput(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark as ready");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (loading) return;
    setLoading(true);
    try {
      await rejectAfterReview(profileId, note.trim() || undefined);
      setNote("");
      setShowNoteInput(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {showNoteInput ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an optional note (max 500 chars)..."
            className="w-full rounded-xl border border-vampBorder bg-black/40 px-3 py-2 text-sm text-white placeholder-vampTextMuted focus:outline-none focus:ring-2 focus:ring-vampAccent"
            rows={3}
            maxLength={500}
          />
          <div className="flex gap-2">
            {showNoteInput === "approve" ? (
              <button
                onClick={handleMarkReady}
                disabled={loading}
                className="rounded-full bg-vampAccent px-4 py-2 text-sm text-white hover:bg-vampAccentSoft transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Ready for Approval"}
              </button>
            ) : (
              <button
                onClick={handleReject}
                disabled={loading}
                className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Rejection"}
              </button>
            )}
            <button
              onClick={() => {
                setShowNoteInput(null);
                setNote("");
              }}
              disabled={loading}
              className="rounded-full bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 border border-vampBorder transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowNoteInput("approve")}
            disabled={loading}
            className="rounded-full bg-vampAccent px-4 py-2 text-sm text-white hover:bg-vampAccentSoft transition-colors disabled:opacity-50"
          >
            Ready for Approval
          </button>
          <button
            onClick={() => setShowNoteInput("reject")}
            disabled={loading}
            className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
