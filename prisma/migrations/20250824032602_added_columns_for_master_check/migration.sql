-- AlterTable
ALTER TABLE "Skupka" ADD COLUMN     "finalPrice" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "DeviceInspection" (
    "id" TEXT NOT NULL,
    "skupkaId" TEXT NOT NULL,
    "masterTelegramId" TEXT NOT NULL,
    "inspectionToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "testsResults" JSONB NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "inspectionNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceInspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeviceInspection_skupkaId_idx" ON "DeviceInspection"("skupkaId");

-- CreateIndex
CREATE INDEX "DeviceInspection_masterTelegramId_idx" ON "DeviceInspection"("masterTelegramId");

-- CreateIndex
CREATE INDEX "DeviceInspection_inspectionToken_idx" ON "DeviceInspection"("inspectionToken");

-- AddForeignKey
ALTER TABLE "DeviceInspection" ADD CONSTRAINT "DeviceInspection_skupkaId_fkey" FOREIGN KEY ("skupkaId") REFERENCES "Skupka"("id") ON DELETE CASCADE ON UPDATE CASCADE;
