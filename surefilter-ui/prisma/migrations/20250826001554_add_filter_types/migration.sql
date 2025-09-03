-- CreateEnum
CREATE TYPE "public"."FilterCategory" AS ENUM ('HEAVY_DUTY', 'AUTOMOTIVE');

-- CreateTable
CREATE TABLE "public"."FilterType" (
    "id" TEXT NOT NULL,
    "category" "public"."FilterCategory" NOT NULL,
    "parentId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "heroImage" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "pageSlug" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fullSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilterType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilterType_fullSlug_key" ON "public"."FilterType"("fullSlug");

-- CreateIndex
CREATE INDEX "FilterType_category_position_idx" ON "public"."FilterType"("category", "position");

-- CreateIndex
CREATE UNIQUE INDEX "FilterType_category_parentId_slug_key" ON "public"."FilterType"("category", "parentId", "slug");

-- AddForeignKey
ALTER TABLE "public"."FilterType" ADD CONSTRAINT "FilterType_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."FilterType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
