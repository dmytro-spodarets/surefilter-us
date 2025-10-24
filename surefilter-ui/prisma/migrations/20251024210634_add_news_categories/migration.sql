/*
  Warnings:

  - You are about to drop the column `category` on the `NewsArticle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."NewsArticle_category_idx";

-- AlterTable
ALTER TABLE "public"."NewsArticle" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "public"."NewsCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsCategory_name_key" ON "public"."NewsCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NewsCategory_slug_key" ON "public"."NewsCategory"("slug");

-- CreateIndex
CREATE INDEX "NewsCategory_position_idx" ON "public"."NewsCategory"("position");

-- CreateIndex
CREATE INDEX "NewsArticle_categoryId_idx" ON "public"."NewsArticle"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."NewsArticle" ADD CONSTRAINT "NewsArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."NewsCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
