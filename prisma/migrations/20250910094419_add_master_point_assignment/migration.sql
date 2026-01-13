-- AlterTable
ALTER TABLE "public"."Skupka" ADD COLUMN     "aiAnalysis" JSONB,
ADD COLUMN     "assignedMasterId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Skupka" ADD CONSTRAINT "Skupka_assignedMasterId_fkey" FOREIGN KEY ("assignedMasterId") REFERENCES "public"."Master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
