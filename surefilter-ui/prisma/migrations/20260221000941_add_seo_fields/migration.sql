-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "llmsSiteDescription" TEXT,
ADD COLUMN     "seoRobotsBlock" BOOLEAN NOT NULL DEFAULT false;
