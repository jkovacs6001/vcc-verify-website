-- AlterTable: add reportType and contractAddress, make walletAddress optional
ALTER TABLE "ScamReport" ADD COLUMN "reportType" TEXT NOT NULL DEFAULT 'wallet';
ALTER TABLE "ScamReport" ADD COLUMN "contractAddress" TEXT;
ALTER TABLE "ScamReport" ALTER COLUMN "walletAddress" DROP NOT NULL;

-- DropIndex: old walletAddress index (was on non-nullable column)
DROP INDEX IF EXISTS "ScamReport_walletAddress_idx";
