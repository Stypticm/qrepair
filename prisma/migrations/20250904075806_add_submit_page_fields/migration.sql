-- AlterTable
ALTER TABLE "public"."Skupka" ADD COLUMN     "courierAddress" TEXT,
ADD COLUMN     "courierDate" TIMESTAMP(3),
ADD COLUMN     "courierTime" TEXT,
ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "pickupPoint" TEXT,
ADD COLUMN     "priceAgreed" BOOLEAN,
ADD COLUMN     "telegramIdConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userTelegramId" TEXT;
