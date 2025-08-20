-- AlterTable
ALTER TABLE "Skupka" ADD COLUMN     "courierReminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "courierScheduledAt" TIMESTAMP(3),
ADD COLUMN     "courierTelegramId" TEXT,
ADD COLUMN     "courierTimeSlot" TEXT,
ADD COLUMN     "courierUserConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imeiInfo" JSONB,
ADD COLUMN     "inspection" JSONB,
ADD COLUMN     "inspectionCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inspectionToken" TEXT;
