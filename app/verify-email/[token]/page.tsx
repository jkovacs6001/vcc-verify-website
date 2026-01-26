import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Invalid Verification Link</h1>
        <p className="text-vampTextMuted">
          This verification link is invalid or has been removed.
        </p>
        <Link
          href="/apply"
          className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
        >
          Apply Again
        </Link>
      </div>
    );
  }

  try {
    // Find profile with this token
    const profile = await prisma.profile.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        displayName: true,
        emailVerified: true,
        verificationTokenExpiry: true,
      },
    });

    if (!profile) {
      return (
        <div className="max-w-lg space-y-4">
          <h1 className="text-3xl font-semibold text-white">Invalid Link</h1>
          <p className="text-vampTextMuted">
            This verification link is invalid or has already been used.
          </p>
          <Link
            href="/member"
            className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      );
    }

    // Check if already verified
    if (profile.emailVerified) {
      return (
        <div className="max-w-lg space-y-4">
          <h1 className="text-3xl font-semibold text-white">Already Verified ✓</h1>
          <p className="text-vampTextMuted">
            Your email address has already been verified.
          </p>
          <Link
            href="/member"
            className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      );
    }

    // Check if token expired
    if (profile.verificationTokenExpiry && profile.verificationTokenExpiry < new Date()) {
      return (
        <div className="max-w-lg space-y-4">
          <h1 className="text-3xl font-semibold text-white">Link Expired</h1>
          <p className="text-vampTextMuted">
            This verification link has expired. Please sign in to your account to request a new verification email.
          </p>
          <Link
            href="/member"
            className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
          >
            Sign In
          </Link>
        </div>
      );
    }

    // Verify the email
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Email Verified! ✓</h1>
        <p className="text-vampTextMuted">
          Thanks, {profile.displayName}! Your email address has been successfully verified.
        </p>
        <p className="text-vampTextMuted">
          You can now sign in to your account and track your verification application.
        </p>
        <Link
          href="/member"
          className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold text-white">Verification Failed</h1>
        <p className="text-vampTextMuted">
          Sorry, something went wrong while verifying your email. Please try again or contact support.
        </p>
        <Link
          href="/member"
          className="inline-flex items-center justify-center rounded-full bg-vampAccent px-5 py-2.5 text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }
}
