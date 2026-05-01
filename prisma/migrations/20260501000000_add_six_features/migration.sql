-- CreateEnum
CREATE TYPE "ScamReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'CONFIRMED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "BadgeLevel" AS ENUM ('BASIC', 'TRUSTED', 'ELITE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED');

-- AlterTable: add trustScore and badgeLevel to Profile
ALTER TABLE "Profile" ADD COLUMN "trustScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN "badgeLevel" "BadgeLevel";

-- CreateTable: ScamReport
CREATE TABLE "ScamReport" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'solana',
    "projectName" TEXT,
    "description" TEXT NOT NULL,
    "evidenceLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ScamReportStatus" NOT NULL DEFAULT 'PENDING',
    "reporterIp" TEXT,
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScamReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BlacklistedWallet
CREATE TABLE "BlacklistedWallet" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'solana',
    "reason" TEXT NOT NULL,
    "scamReportId" TEXT,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistedWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Project
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "contractAddress" TEXT,
    "chain" TEXT NOT NULL DEFAULT 'solana',
    "description" TEXT NOT NULL,
    "teamContact" TEXT NOT NULL,
    "twitterHandle" TEXT,
    "telegramHandle" TEXT,
    "githubUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TrustScoreAudit
CREATE TABLE "TrustScoreAudit" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustScoreAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScamReport_walletAddress_idx" ON "ScamReport"("walletAddress");

-- CreateIndex
CREATE INDEX "ScamReport_status_idx" ON "ScamReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedWallet_walletAddress_key" ON "BlacklistedWallet"("walletAddress");

-- CreateIndex
CREATE INDEX "BlacklistedWallet_walletAddress_idx" ON "BlacklistedWallet"("walletAddress");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "TrustScoreAudit_profileId_idx" ON "TrustScoreAudit"("profileId");

-- AddForeignKey
ALTER TABLE "TrustScoreAudit" ADD CONSTRAINT "TrustScoreAudit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
