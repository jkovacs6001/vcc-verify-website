import { cookies } from "next/headers";
import Link from "next/link";
import { memberLogin, memberLogout, getMemberSession } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberPage() {
  const member = await getMemberSession();

  if (!member) {
    return (
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">My Dashboard</h1>
          <p className="mt-2 text-vampTextMuted">
            Sign in to view your applications and access reviewer/approver tools.
          </p>
        </div>

        <form action={memberLogin} className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-white"
              required
              minLength={8}
            />
          </div>
          <button className="w-full rounded-full bg-vampAccent px-5 py-3 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors font-medium">
            Sign In
          </button>
        </form>

        <p className="text-xs text-vampTextMuted text-center">
          Use the email and password you provided when you applied.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Welcome, {member.displayName}</h1>
        <p className="mt-2 text-vampTextMuted">
          Manage your profile and access your role-specific tools.
        </p>
      </div>

      {/* Profile Status */}
      <div className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-3">
        <div className="text-sm font-medium text-white">Profile Status</div>
        <div className="flex items-center justify-between">
          <span className="text-vampTextMuted">Verification Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              member.status === "APPROVED"
                ? "bg-emerald-500/15 text-emerald-300"
                : member.status === "PENDING"
                ? "bg-amber-500/15 text-amber-300"
                : member.status === "REJECTED"
                ? "bg-red-500/15 text-red-300"
                : "bg-gray-500/15 text-gray-300"
            }`}
          >
            {member.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-vampTextMuted">Your Role:</span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-vampAccent/15 text-vampAccent">
            {member.userRole}
          </span>
        </div>
      </div>

      {/* Role-based Actions */}
      {(member.userRole === "REVIEWER" || member.userRole === "APPROVER" || member.userRole === "ADMIN") && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-white">Your Tools</div>
          <div className="flex flex-wrap gap-3">
            {(member.userRole === "REVIEWER" || member.userRole === "APPROVER") && (
              <Link
                href="/review"
                className="inline-flex items-center justify-center rounded-full bg-blue-600/80 px-6 py-3 text-white shadow-vampGlow hover:bg-blue-700 transition-colors font-medium"
              >
                Review Applications
              </Link>
            )}
            {member.userRole === "APPROVER" && (
              <Link
                href="/approve"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600/80 px-6 py-3 text-white shadow-vampGlow hover:bg-emerald-700 transition-colors font-medium"
              >
                Approvals
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <form action={memberLogout}>
        <button className="rounded-full bg-white/5 px-5 py-2 text-white hover:bg-white/10 border border-vampBorder transition-colors text-sm">
          Sign Out
        </button>
      </form>
    </div>
  );
}
