/*
  Warnings:

  - You are about to drop the column `fullSlug` on the `FilterType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pageSlug]` on the table `FilterType` will be added. If there are existing duplicate values, this will fail.
  - Made the column `pageSlug` on table `FilterType` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "FilterType_fullSlug_key";

-- AlterTable
ALTER TABLE "FilterType" DROP COLUMN "fullSlug",
ALTER COLUMN "pageSlug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FilterType_pageSlug_key" ON "FilterType"("pageSlug");
