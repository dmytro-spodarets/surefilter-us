-- CreateEnum
CREATE TYPE "public"."SectionType" AS ENUM ('hero_full', 'hero_compact', 'page_hero', 'page_hero_reverse', 'single_image_hero', 'compact_search_hero', 'search_hero', 'why_choose', 'featured_products', 'products', 'quick_search', 'industries', 'industries_list', 'industry_meta', 'listing_card_meta', 'filter_types_grid', 'popular_filters', 'about_with_stats', 'about_news', 'quality_assurance', 'content_with_images', 'related_filters', 'news_carousel', 'product_gallery', 'product_specs', 'limited_warranty_details', 'magnusson_moss_act', 'warranty_claim_process', 'warranty_contact', 'warranty_promise', 'contact_options');

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ogImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Section" (
    "id" TEXT NOT NULL,
    "type" "public"."SectionType" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page"("slug");

-- CreateIndex
CREATE INDEX "PageSection_pageId_position_idx" ON "public"."PageSection"("pageId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "PageSection_pageId_sectionId_key" ON "public"."PageSection"("pageId", "sectionId");

-- AddForeignKey
ALTER TABLE "public"."PageSection" ADD CONSTRAINT "PageSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageSection" ADD CONSTRAINT "PageSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
