/*
  Warnings:

  - You are about to drop the column `condition` on the `Skupka` table. All the data in the column will be lost.
  - You are about to drop the column `cracks` on the `Skupka` table. All the data in the column will be lost.
  - You are about to drop the column `imeiInfo` on the `Skupka` table. All the data in the column will be lost.
  - You are about to drop the column `questionsAnswered` on the `Skupka` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Skupka` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Skupka" DROP COLUMN "condition",
DROP COLUMN "cracks",
DROP COLUMN "imeiInfo",
DROP COLUMN "questionsAnswered",
DROP COLUMN "videoUrl",
ADD COLUMN     "deviceData" JSONB;
