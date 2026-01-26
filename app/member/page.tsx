import { cookies } from "next/headers";
import Link from "next/link";
import { memberLogin, memberLogout, getMemberSession, resendVerificationEmail } from "./actions";

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
          Use the email and password from your account.
        </p>

        <div className="text-center text-sm text-vampTextMuted">
          Don't have an account?{" "}
          <Link href="/register" className="text-vampAccent hover:underline">
            Register here
          </Link>
        </div>
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

      {/* Email Verification Banner */}
      {!member.emailVerified && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-yellow-200">Email Not Verified</div>
              <p className="mt-1 text-sm text-yellow-200/80">
                Please check your email and click the verification link we sent you. 
                If you didn't receive it, you can request a new one.
              </p>
              <form action={resendVerificationEmail} className="mt-3">
                <button className="text-sm rounded-full bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-400 transition-colors font-medium">
                  Resend Verification Email
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Status */}
      <div className="rounded-2xl border border-vampBorder bg-black/40 p-5 space-y-3">
        <div className="text-sm font-medium text-white">Profile Status</div>
        
        {member.status === null ? (
          <div className="space-y-3">
            <div className="text-vampTextMuted text-sm">
              You have an account but haven't applied for verification yet.
            </div>
            <Link
              href="/apply"
              className="block w-full rounded-full bg-vampAccent px-5 py-3 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors font-medium text-center"
            >
              Apply for Verification
            </Link>
          </div>
        ) : (
          <>
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
                    : member.status === "REVIEWING"
                    ? "bg-blue-500/15 text-blue-300"
                    : member.status === "READY_FOR_APPROVAL"
                    ? "bg-purple-500/15 text-purple-300"
                    : "bg-gray-500/15 text-gray-300"
                }`}
              >
                {member.status}
              </span>
            </div>
          </>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-vampTextMuted">Your Roles:</span>
          <div className="flex flex-wrap gap-2 justify-end">
            {member.userRoles.map((role) => (
              <span key={role} className="px-3 py-1 rounded-full text-sm font-medium bg-vampAccent/15 text-vampAccent">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Role-based Actions */}
      {(member.userRoles.includes("REVIEWER") || member.userRoles.includes("APPROVER") || member.userRoles.includes("ADMIN")) && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-white">Your Tools</div>
          <div className="flex flex-wrap gap-3">
            {(member.userRoles.includes("REVIEWER") || member.userRoles.includes("APPROVER")) && (
              <Link
                href="/review"
                className="inline-flex items-center justify-center rounded-full bg-blue-600/80 px-6 py-3 text-white shadow-vampGlow hover:bg-blue-700 transition-colors font-medium"
              >
                Review Applications
              </Link>
            )}
            {member.userRoles.includes("APPROVER") && (
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
