/*
  Warnings:

  - You are about to drop the column `user_id` on the `allocations` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `consultants` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `projects` table. All the data in the column will be lost.
  - Added the required column `clerk_user_id` to the `allocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerk_user_id` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerk_user_id` to the `consultants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerk_user_id` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "allocations_user_id_idx";

-- DropIndex
DROP INDEX "clients_user_id_idx";

-- DropIndex
DROP INDEX "consultants_user_id_idx";

-- DropIndex
DROP INDEX "projects_user_id_idx";

-- AlterTable
ALTER TABLE "allocations" DROP COLUMN "user_id",
ADD COLUMN     "clerk_user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "user_id",
ADD COLUMN     "clerk_user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "consultants" DROP COLUMN "user_id",
ADD COLUMN     "clerk_user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "user_id",
ADD COLUMN     "clerk_user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "allocations_clerk_user_id_idx" ON "allocations"("clerk_user_id");

-- CreateIndex
CREATE INDEX "clients_clerk_user_id_idx" ON "clients"("clerk_user_id");

-- CreateIndex
CREATE INDEX "consultants_clerk_user_id_idx" ON "consultants"("clerk_user_id");

-- CreateIndex
CREATE INDEX "projects_clerk_user_id_idx" ON "projects"("clerk_user_id");
