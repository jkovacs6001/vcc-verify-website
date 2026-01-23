-- AlterTable - Add unique index on email (ignoring duplicates if they exist)
-- First, delete any duplicate emails keeping only the first one
DELETE FROM "Profile" p1
WHERE p1.id > (
  SELECT p2.id
  FROM "Profile" p2
  WHERE p1.email = p2.email
  ORDER BY p2."createdAt" ASC
  LIMIT 1
);

-- Now add the unique constraint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_email_key" UNIQUE ("email");


