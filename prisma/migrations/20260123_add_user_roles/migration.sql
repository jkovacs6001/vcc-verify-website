-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'REVIEWER', 'APPROVER', 'ADMIN');

-- AlterEnum
ALTER TYPE "ReviewStatus" ADD VALUE 'REVIEWING';
ALTER TYPE "ReviewStatus" ADD VALUE 'READY_FOR_APPROVAL';

-- RenameColumn
ALTER TABLE "Profile" RENAME COLUMN "role" TO "submissionRole";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "userRole" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE INDEX "Profile_userRole_idx" ON "Profile"("userRole");
