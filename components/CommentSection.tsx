"use client";

import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    displayName: string;
    email: string;
  };
};

type CommentSectionProps = {
  profileId: string;
  comments: Comment[];
  addCommentAction: (profileId: string, content: string) => Promise<void>;
};

export function CommentSection({ profileId, comments, addCommentAction }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addCommentAction(profileId, newComment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-white">
            Review Notes ({comments.length})
          </div>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-vampBorder/60 bg-black/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs text-vampTextMuted mb-1">
                    <span className="font-semibold text-white">
                      {comment.author.displayName}
                    </span>
                    {" · "}
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/90 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a review note (only visible to reviewers/approvers)..."
          className="w-full rounded-xl border border-vampBorder bg-black/40 px-4 py-3 text-white placeholder:text-vampTextMuted focus:border-vampAccent focus:outline-none focus:ring-1 focus:ring-vampAccent resize-none"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-vampTextMuted">
            {newComment.length}/1000 characters
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="rounded-full bg-vampAccent px-4 py-2 text-sm text-white hover:bg-vampAccentSoft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
