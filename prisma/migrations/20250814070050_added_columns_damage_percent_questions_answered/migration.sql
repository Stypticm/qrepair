-- AlterTable
ALTER TABLE "Skupka" ADD COLUMN     "damagePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "questionsAnswered" BOOLEAN NOT NULL DEFAULT false;
