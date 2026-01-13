-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('draft', 'submitted', 'cancelled', 'completed');

-- CreateTable
CREATE TABLE "RepairRequest" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "brandname" TEXT,
    "modelname" TEXT,
    "brandModelText" TEXT,
    "crash" TEXT,
    "photoUrls" TEXT[],
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" "RequestStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairRequest_pkey" PRIMARY KEY ("id")
);
