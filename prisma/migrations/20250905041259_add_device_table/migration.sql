-- CreateTable
CREATE TABLE "public"."Device" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "simType" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Device_model_idx" ON "public"."Device"("model");

-- CreateIndex
CREATE INDEX "Device_model_variant_idx" ON "public"."Device"("model", "variant");

-- CreateIndex
CREATE INDEX "Device_model_variant_storage_idx" ON "public"."Device"("model", "variant", "storage");

-- CreateIndex
CREATE INDEX "Device_model_variant_storage_color_idx" ON "public"."Device"("model", "variant", "storage", "color");

-- CreateIndex
CREATE INDEX "Device_country_idx" ON "public"."Device"("country");

-- CreateIndex
CREATE INDEX "Device_simType_idx" ON "public"."Device"("simType");

-- CreateIndex
CREATE INDEX "Device_basePrice_idx" ON "public"."Device"("basePrice");
