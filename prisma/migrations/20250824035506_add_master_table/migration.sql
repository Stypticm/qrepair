/*
  Warnings:

  - You are about to drop the column `masterTelegramId` on the `DeviceInspection` table. All the data in the column will be lost.
  - Added the required column `masterUsername` to the `DeviceInspection` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DeviceInspection_masterTelegramId_idx";

-- AlterTable
ALTER TABLE "DeviceInspection" DROP COLUMN "masterTelegramId",
ADD COLUMN     "masterUsername" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Master" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Master_telegramId_key" ON "Master"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Master_username_key" ON "Master"("username");

-- CreateIndex
CREATE INDEX "DeviceInspection_masterUsername_idx" ON "DeviceInspection"("masterUsername");

-- AddForeignKey
ALTER TABLE "DeviceInspection" ADD CONSTRAINT "DeviceInspection_masterUsername_fkey" FOREIGN KEY ("masterUsername") REFERENCES "Master"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
