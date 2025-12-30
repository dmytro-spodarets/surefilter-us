-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "catalogPassword" TEXT,
ADD COLUMN     "catalogPasswordEnabled" BOOLEAN NOT NULL DEFAULT false;
