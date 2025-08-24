-- DropForeignKey
ALTER TABLE "DeviceInspection" DROP CONSTRAINT "DeviceInspection_masterUsername_fkey";

-- AddForeignKey
ALTER TABLE "DeviceInspection" ADD CONSTRAINT "DeviceInspection_masterUsername_fkey" FOREIGN KEY ("masterUsername") REFERENCES "Master"("username") ON DELETE SET NULL ON UPDATE CASCADE;
