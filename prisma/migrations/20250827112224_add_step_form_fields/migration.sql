-- AlterEnum
ALTER TYPE "public"."SkupkaStatus" ADD VALUE 'submitted';

-- DropForeignKey
ALTER TABLE "public"."DeviceInspection" DROP CONSTRAINT "DeviceInspection_masterUsername_fkey";

-- AlterTable
ALTER TABLE "public"."Skupka" ADD COLUMN     "condition" TEXT,
ADD COLUMN     "cracks" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."DeviceInspection" ADD CONSTRAINT "DeviceInspection_masterUsername_fkey" FOREIGN KEY ("masterUsername") REFERENCES "public"."Master"("username") ON DELETE CASCADE ON UPDATE CASCADE;
