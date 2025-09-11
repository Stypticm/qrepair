-- AlterTable
ALTER TABLE "public"."Point" ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'Приём устройств на ремонт',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Точка приёма';
