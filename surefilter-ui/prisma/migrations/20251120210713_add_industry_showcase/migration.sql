-- AlterEnum
ALTER TYPE "public"."SectionType" ADD VALUE 'industry_showcase';

-- CreateTable
CREATE TABLE "public"."IndustryShowcase" (
    "id" TEXT NOT NULL,
    "industrySlug" TEXT NOT NULL,
    "industryTitle" TEXT NOT NULL,
    "industryDescription" TEXT NOT NULL,
    "brandPromise" TEXT NOT NULL,
    "keyFeatures" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustryShowcase_industrySlug_key" ON "public"."IndustryShowcase"("industrySlug");

-- CreateIndex
CREATE INDEX "IndustryShowcase_industrySlug_idx" ON "public"."IndustryShowcase"("industrySlug");

-- CreateIndex
CREATE INDEX "IndustryShowcase_isActive_idx" ON "public"."IndustryShowcase"("isActive");
