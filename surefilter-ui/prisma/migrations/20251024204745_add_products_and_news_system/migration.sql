/*
  Warnings:

  - The values [industry_meta,feature_highlights,compatible_industries] on the enum `SectionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ArticleType" AS ENUM ('NEWS', 'EVENT');

-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SectionType_new" AS ENUM ('hero_full', 'hero_compact', 'page_hero', 'page_hero_reverse', 'single_image_hero', 'compact_search_hero', 'search_hero', 'simple_search', 'why_choose', 'featured_products', 'products', 'quick_search', 'industries', 'industries_list', 'listing_card_meta', 'filter_types_grid', 'filter_types_image_grid', 'popular_filters', 'about_with_stats', 'about_news', 'quality_assurance', 'content_with_images', 'related_filters', 'news_carousel', 'product_gallery', 'product_specs', 'limited_warranty_details', 'magnusson_moss_act', 'warranty_claim_process', 'warranty_contact', 'warranty_promise', 'contact_options', 'manufacturing_facilities', 'our_company', 'stats_band', 'awards_carousel', 'contact_hero', 'contact_form', 'contact_info', 'contact_details', 'contact_form_info');
ALTER TABLE "public"."Section" ALTER COLUMN "type" TYPE "public"."SectionType_new" USING ("type"::text::"public"."SectionType_new");
ALTER TYPE "public"."SectionType" RENAME TO "SectionType_old";
ALTER TYPE "public"."SectionType_new" RENAME TO "SectionType";
DROP TYPE "public"."SectionType_old";
COMMIT;

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."FilterCategory",
    "filterTypeId" TEXT,
    "status" TEXT,
    "images" JSONB NOT NULL,
    "specsLeft" JSONB NOT NULL,
    "specsRight" JSONB NOT NULL,
    "oems" JSONB NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "manufacturer" TEXT,
    "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "heightMm" DOUBLE PRECISION,
    "odMm" DOUBLE PRECISION,
    "idMm" DOUBLE PRECISION,
    "thread" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpecParameter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "category" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductSpecValue" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unitOverride" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSpecValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."ArticleType" NOT NULL DEFAULT 'NEWS',
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "featuredImageAlt" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "eventStartDate" TIMESTAMP(3),
    "eventEndDate" TIMESTAMP(3),
    "eventUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "venue" TEXT,
    "location" TEXT,
    "booth" TEXT,
    "hall" TEXT,
    "eventType" TEXT,
    "attendees" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "public"."Product"("code");

-- CreateIndex
CREATE INDEX "Product_filterTypeId_idx" ON "public"."Product"("filterTypeId");

-- CreateIndex
CREATE INDEX "SpecParameter_category_position_idx" ON "public"."SpecParameter"("category", "position");

-- CreateIndex
CREATE INDEX "ProductSpecValue_productId_position_idx" ON "public"."ProductSpecValue"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecValue_productId_parameterId_key" ON "public"."ProductSpecValue"("productId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "public"."NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_type_publishedAt_idx" ON "public"."NewsArticle"("type", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsArticle_type_status_publishedAt_idx" ON "public"."NewsArticle"("type", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsArticle_type_eventStartDate_idx" ON "public"."NewsArticle"("type", "eventStartDate" ASC);

-- CreateIndex
CREATE INDEX "NewsArticle_type_isFeatured_eventStartDate_idx" ON "public"."NewsArticle"("type", "isFeatured", "eventStartDate" ASC);

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "public"."NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_status_idx" ON "public"."NewsArticle"("status");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_filterTypeId_fkey" FOREIGN KEY ("filterTypeId") REFERENCES "public"."FilterType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."SpecParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
