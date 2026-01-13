/*
  Warnings:

  - The `crash` column on the `RepairRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RepairRequest" DROP COLUMN "crash",
ADD COLUMN     "crash" TEXT[];
