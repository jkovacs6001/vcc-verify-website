-- Make wallet nullable on Profile
ALTER TABLE "Profile" ALTER COLUMN "wallet" DROP NOT NULL;
