-- AlterTable
ALTER TABLE "public"."Master" ADD COLUMN     "pointId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Point" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Point_address_key" ON "public"."Point"("address");

-- AddForeignKey
ALTER TABLE "public"."Master" ADD CONSTRAINT "Master_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "public"."Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;
