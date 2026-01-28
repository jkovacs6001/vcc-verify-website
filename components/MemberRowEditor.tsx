"use client";

import { useState } from "react";
import { updateUserRoles, deleteUser } from "@/app/admin/actions";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "MEMBER", label: "Member" },
  { value: "REVIEWER", label: "Reviewer" },
  { value: "APPROVER", label: "Approver" },
  { value: "ADMIN", label: "Admin" },
];

interface MemberRowEditorProps {
  profile: {
    id: string;
    displayName: string;
    email: string;
    userRoles: string[];
    createdAt: Date;
  };
}

export function MemberRowEditor({ profile }: MemberRowEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(profile.userRoles);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleRoleToggle(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSave() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileId", profile.id);
      selectedRoles.forEach((role) => formData.append("roles", role));
      await updateUserRoles(formData);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update roles");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setSelectedRoles(profile.userRoles);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteUser(profile.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
      setLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-vampBorder bg-black/40 p-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">
            {profile.displayName}
            <span className="ml-2 text-xs text-vampTextMuted break-all">({profile.email})</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.userRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-vampAccent/20 px-2 py-0.5 text-xs text-white"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="shrink-0 rounded-lg bg-white/5 p-2 text-white hover:bg-white/10 transition-colors"
          title="Edit roles"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-vampAccent/50 bg-black/40 p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-white">{profile.displayName}</div>
        <div className="text-xs text-vampTextMuted break-all">{profile.email}</div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold text-white">Roles</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {ROLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-xs text-vampTextMuted cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(opt.value)}
                onChange={() => handleRoleToggle(opt.value)}
                disabled={loading}
                className="h-4 w-4 rounded border-vampBorder bg-black/40 cursor-pointer"
              />
              <span className="text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {showDeleteConfirm ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 mb-3">
          <div className="text-sm text-white mb-2">Are you sure you want to delete this user?</div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-vampAccent px-3 py-1.5 text-xs font-semibold text-black hover:brightness-95 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="ml-auto rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
          >
            Delete User
          </button>
        </div>
      )}
    </div>
  );
}
