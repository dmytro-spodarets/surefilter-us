-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('LEAD_CAPTURE', 'CTA');

-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BannerCampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BannerDismissMode" AS ENUM ('SESSION', 'DAYS', 'FOREVER');

-- CreateTable
CREATE TABLE "BannerCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "BannerCampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "notifyEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "BannerType" NOT NULL,
    "status" "BannerStatus" NOT NULL DEFAULT 'DRAFT',
    "layout" TEXT NOT NULL DEFAULT 'classic_centered',
    "accentColor" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "ctaOpenInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "emailPlaceholder" TEXT DEFAULT 'Enter your email',
    "submitLabel" TEXT DEFAULT 'Subscribe',
    "successTitle" TEXT DEFAULT 'Thanks!',
    "successMessage" TEXT,
    "notifyEmail" TEXT,
    "targetAllPages" BOOLEAN NOT NULL DEFAULT true,
    "targetSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "delayMs" INTEGER NOT NULL DEFAULT 5000,
    "utmRules" JSONB,
    "refererRules" JSONB,
    "dismissMode" "BannerDismissMode" NOT NULL DEFAULT 'DAYS',
    "dismissTtlDays" INTEGER DEFAULT 30,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerImpression" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "pageUrl" TEXT,
    "pageSlug" TEXT,
    "utmParams" JSONB,
    "referer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BannerImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerClick" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "pageUrl" TEXT,
    "pageSlug" TEXT,
    "utmParams" JSONB,
    "referer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "clickedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BannerClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerSubmission" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pageUrl" TEXT,
    "utmParams" JSONB,
    "referer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BannerSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannerCampaign_slug_key" ON "BannerCampaign"("slug");

-- CreateIndex
CREATE INDEX "BannerCampaign_status_idx" ON "BannerCampaign"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_slug_key" ON "Banner"("slug");

-- CreateIndex
CREATE INDEX "Banner_status_publishedAt_idx" ON "Banner"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Banner_campaignId_idx" ON "Banner"("campaignId");

-- CreateIndex
CREATE INDEX "Banner_priority_idx" ON "Banner"("priority");

-- CreateIndex
CREATE INDEX "BannerImpression_bannerId_createdAt_idx" ON "BannerImpression"("bannerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BannerImpression_createdAt_idx" ON "BannerImpression"("createdAt");

-- CreateIndex
CREATE INDEX "BannerClick_bannerId_createdAt_idx" ON "BannerClick"("bannerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BannerClick_createdAt_idx" ON "BannerClick"("createdAt");

-- CreateIndex
CREATE INDEX "BannerSubmission_bannerId_createdAt_idx" ON "BannerSubmission"("bannerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BannerSubmission_email_idx" ON "BannerSubmission"("email");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BannerCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerImpression" ADD CONSTRAINT "BannerImpression_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerClick" ADD CONSTRAINT "BannerClick_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerSubmission" ADD CONSTRAINT "BannerSubmission_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
