/*
  Warnings:

  - You are about to drop the column `condition` on the `Skupka` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Skupka" DROP COLUMN "condition",
ADD COLUMN     "answers" INTEGER[] DEFAULT ARRAY[0, 0, 0, 0, 0, 0, 0, 0]::INTEGER[],
ADD COLUMN     "price" DOUBLE PRECISION;

-- DropEnum
DROP TYPE "ConditionStatus";
