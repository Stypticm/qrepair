-- CreateTable
CREATE TABLE "public"."MarketPrice" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "url" TEXT,
    "title" TEXT,
    "description" TEXT,
    "location" TEXT,
    "condition" TEXT,
    "sellerType" TEXT,
    "parsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketPrice_deviceId_idx" ON "public"."MarketPrice"("deviceId");

-- CreateIndex
CREATE INDEX "MarketPrice_source_idx" ON "public"."MarketPrice"("source");

-- CreateIndex
CREATE INDEX "MarketPrice_parsedAt_idx" ON "public"."MarketPrice"("parsedAt");

-- CreateIndex
CREATE INDEX "MarketPrice_price_idx" ON "public"."MarketPrice"("price");

-- CreateIndex
CREATE INDEX "MarketPrice_source_deviceId_idx" ON "public"."MarketPrice"("source", "deviceId");

-- AddForeignKey
ALTER TABLE "public"."MarketPrice" ADD CONSTRAINT "MarketPrice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
