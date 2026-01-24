/*
  Warnings:

  - You are about to drop the column `userRole` on the `Profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Profile_userRole_idx";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "userRole",
ADD COLUMN     "userRoles" "UserRole"[] DEFAULT ARRAY['MEMBER']::"UserRole"[];
