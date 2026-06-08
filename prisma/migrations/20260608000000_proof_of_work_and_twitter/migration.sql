-- Add portfolioLinks array to Profile for proof-of-work evidence
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "portfolioLinks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add twitterHandle to ScamReport for X/Twitter account reports
ALTER TABLE "ScamReport" ADD COLUMN IF NOT EXISTS "twitterHandle" TEXT;
