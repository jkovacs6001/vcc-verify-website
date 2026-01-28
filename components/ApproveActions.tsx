"use client";

import { useState } from "react";
import { approveApplication, rejectApplication } from "@/app/approve/actions";

export function ApproveActions({ profileId, status }: { profileId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  async function handleApprove() {
    if (loading) return;
    setLoading(true);
    try {
      await approveApplication(profileId, note.trim() || undefined);
      setNote("");
      setShowNoteInput(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (loading) return;
    setLoading(true);
    try {
      await rejectApplication(profileId, note.trim() || undefined);
      setNote("");
      setShowNoteInput(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setLoading(false);
    }
  }

  // Only show approve button for READY_FOR_APPROVAL status
  const canApprove = status === "READY_FOR_APPROVAL";

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
                onClick={handleApprove}
                disabled={loading}
                className="rounded-full bg-vampAccent px-4 py-2 text-sm text-white hover:bg-vampAccentSoft transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Approval"}
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
          {canApprove && (
            <button
              onClick={() => setShowNoteInput("approve")}
              disabled={loading}
              className="rounded-full bg-vampAccent px-4 py-2 text-sm text-white hover:bg-vampAccentSoft transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          )}
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
