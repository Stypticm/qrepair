/*
  Warnings:

  - You are about to drop the column `description` on the `Point` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Point" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "public"."Skupka" ADD COLUMN     "userEvaluation" TEXT;
