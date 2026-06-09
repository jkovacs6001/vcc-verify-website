ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_passwordResetToken_key" ON "Profile"("passwordResetToken");
