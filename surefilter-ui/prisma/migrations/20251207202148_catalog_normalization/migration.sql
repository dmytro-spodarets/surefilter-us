/*
  Warnings:

  - You are about to drop the column `category` on the `FilterType` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `heightMm` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `idMm` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `odMm` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `oems` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `specsLeft` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `specsRight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `thread` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryId,parentId,slug]` on the table `FilterType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `SpecParameter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brandId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."FilterType_category_parentId_slug_key";

-- DropIndex
DROP INDEX "public"."FilterType_category_position_idx";

-- AlterTable
ALTER TABLE "public"."FilterType" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "category",
DROP COLUMN "heightMm",
DROP COLUMN "idMm",
DROP COLUMN "images",
DROP COLUMN "model",
DROP COLUMN "odMm",
DROP COLUMN "oems",
DROP COLUMN "specsLeft",
DROP COLUMN "specsRight",
DROP COLUMN "thread",
ADD COLUMN     "brandId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SpecParameter" ADD COLUMN     "code" TEXT;

-- DropEnum
DROP TYPE "public"."FilterCategory";

-- CreateTable
CREATE TABLE "public"."ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCategoryAssignment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategoryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductMedia" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCrossReference" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "refBrandName" TEXT NOT NULL,
    "refBrandId" TEXT,
    "refCode" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL DEFAULT 'OEM',
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCrossReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "public"."ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "public"."ProductCategory"("slug");

-- CreateIndex
CREATE INDEX "ProductCategory_position_idx" ON "public"."ProductCategory"("position");

-- CreateIndex
CREATE INDEX "ProductCategory_isActive_idx" ON "public"."ProductCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "public"."Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_code_key" ON "public"."Brand"("code");

-- CreateIndex
CREATE INDEX "Brand_isActive_position_idx" ON "public"."Brand"("isActive", "position");

-- CreateIndex
CREATE INDEX "ProductCategoryAssignment_productId_isPrimary_idx" ON "public"."ProductCategoryAssignment"("productId", "isPrimary");

-- CreateIndex
CREATE INDEX "ProductCategoryAssignment_categoryId_idx" ON "public"."ProductCategoryAssignment"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategoryAssignment_productId_categoryId_key" ON "public"."ProductCategoryAssignment"("productId", "categoryId");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_position_idx" ON "public"."ProductMedia"("productId", "position");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_isPrimary_idx" ON "public"."ProductMedia"("productId", "isPrimary");

-- CreateIndex
CREATE INDEX "ProductMedia_assetId_idx" ON "public"."ProductMedia"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMedia_productId_assetId_key" ON "public"."ProductMedia"("productId", "assetId");

-- CreateIndex
CREATE INDEX "ProductCrossReference_productId_referenceType_idx" ON "public"."ProductCrossReference"("productId", "referenceType");

-- CreateIndex
CREATE INDEX "ProductCrossReference_refCode_idx" ON "public"."ProductCrossReference"("refCode");

-- CreateIndex
CREATE INDEX "ProductCrossReference_refBrandName_idx" ON "public"."ProductCrossReference"("refBrandName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCrossReference_productId_refBrandName_refCode_key" ON "public"."ProductCrossReference"("productId", "refBrandName", "refCode");

-- CreateIndex
CREATE INDEX "FilterType_categoryId_position_idx" ON "public"."FilterType"("categoryId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "FilterType_categoryId_parentId_slug_key" ON "public"."FilterType"("categoryId", "parentId", "slug");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "public"."Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "public"."Product"("status");

-- CreateIndex
CREATE INDEX "ProductSpecValue_parameterId_idx" ON "public"."ProductSpecValue"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecParameter_code_key" ON "public"."SpecParameter"("code");

-- CreateIndex
CREATE INDEX "SpecParameter_isActive_idx" ON "public"."SpecParameter"("isActive");

-- AddForeignKey
ALTER TABLE "public"."FilterType" ADD CONSTRAINT "FilterType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryAssignment" ADD CONSTRAINT "ProductCategoryAssignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryAssignment" ADD CONSTRAINT "ProductCategoryAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductMedia" ADD CONSTRAINT "ProductMedia_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCrossReference" ADD CONSTRAINT "ProductCrossReference_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
