-- SQL для создания таблиц в Supabase
-- Выполни этот скрипт в Supabase SQL Editor

-- 1. Enum для статусов лотов
CREATE TYPE "MarketplaceLotStatus" AS ENUM ('draft', 'available', 'reserved', 'sold', 'archived');

-- 2. Таблица marketplace лотов
CREATE TABLE "MarketplaceLot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skupkaId" TEXT UNIQUE,
    "title" TEXT NOT NULL,
    "model" TEXT,
    "storage" TEXT,
    "color" TEXT,
    "condition" TEXT,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "photos" TEXT[],
    "coverPhoto" TEXT,
    "status" "MarketplaceLotStatus" NOT NULL DEFAULT 'available',
    "sellerId" TEXT NOT NULL,
    "sellerName" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    CONSTRAINT "MarketplaceLot_skupkaId_fkey" FOREIGN KEY ("skupkaId") REFERENCES "Skupka"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Индексы для производительности
CREATE INDEX "MarketplaceLot_sellerId_idx" ON "MarketplaceLot"("sellerId");
CREATE INDEX "MarketplaceLot_status_idx" ON "MarketplaceLot"("status");
CREATE INDEX "MarketplaceLot_createdAt_idx" ON "MarketplaceLot"("createdAt");
CREATE INDEX "MarketplaceLot_price_idx" ON "MarketplaceLot"("price");

-- 3. Таблица корзины
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "MarketplaceLot"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CartItem_userId_lotId_key" ON "CartItem"("userId", "lotId");
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");
CREATE INDEX "CartItem_lotId_idx" ON "CartItem"("lotId");

-- 4. Таблица избранного
CREATE TABLE "FavoriteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "MarketplaceLot"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "FavoriteItem_userId_lotId_key" ON "FavoriteItem"("userId", "lotId");
CREATE INDEX "FavoriteItem_userId_idx" ON "FavoriteItem"("userId");
CREATE INDEX "FavoriteItem_lotId_idx" ON "FavoriteItem"("lotId");

-- 5. Trigger для автообновления updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplacelot_updated_at BEFORE UPDATE ON "MarketplaceLot"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cartitem_updated_at BEFORE UPDATE ON "CartItem"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Готово! Теперь можно использовать эти таблицы в приложении.
