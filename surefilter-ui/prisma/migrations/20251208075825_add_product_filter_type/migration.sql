-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_filterTypeId_fkey";

-- CreateTable
CREATE TABLE "ProductFilterType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFilterType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductFilterType_name_key" ON "ProductFilterType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFilterType_slug_key" ON "ProductFilterType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFilterType_code_key" ON "ProductFilterType"("code");

-- CreateIndex
CREATE INDEX "ProductFilterType_isActive_position_idx" ON "ProductFilterType"("isActive", "position");

-- CreateIndex
CREATE INDEX "ProductFilterType_slug_idx" ON "ProductFilterType"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_filterTypeId_fkey" FOREIGN KEY ("filterTypeId") REFERENCES "ProductFilterType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
