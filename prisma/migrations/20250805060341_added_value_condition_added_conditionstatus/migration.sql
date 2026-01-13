/*
  Warnings:

  - The values [sold,submitted] on the enum `SkupkaStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConditionStatus" AS ENUM ('display', 'display_with_damage', 'body', 'body_with_damage');

-- AlterEnum
BEGIN;
CREATE TYPE "SkupkaStatus_new" AS ENUM ('draft', 'on_the_way', 'in_progress', 'accepted', 'paid');
ALTER TABLE "Skupka" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Skupka" ALTER COLUMN "status" TYPE "SkupkaStatus_new" USING ("status"::text::"SkupkaStatus_new");
ALTER TYPE "SkupkaStatus" RENAME TO "SkupkaStatus_old";
ALTER TYPE "SkupkaStatus_new" RENAME TO "SkupkaStatus";
DROP TYPE "SkupkaStatus_old";
ALTER TABLE "Skupka" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterTable
ALTER TABLE "Skupka" ADD COLUMN     "condition" "ConditionStatus"[] DEFAULT ARRAY['display', 'body']::"ConditionStatus"[];
