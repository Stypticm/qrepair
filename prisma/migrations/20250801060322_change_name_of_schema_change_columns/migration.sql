/*
  Warnings:

  - You are about to drop the `RepairRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SkupkaStatus" AS ENUM ('draft', 'in_progress', 'sold');

-- DropTable
DROP TABLE "RepairRequest";

-- DropEnum
DROP TYPE "RequestStatus";

-- CreateTable
CREATE TABLE "Skupka" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "modelname" TEXT,
    "photoUrls" TEXT[],
    "videoUrl" TEXT,
    "status" "SkupkaStatus" NOT NULL DEFAULT 'draft',
    "comment" TEXT,
    "imei" TEXT,
    "contractUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skupka_pkey" PRIMARY KEY ("id")
);
