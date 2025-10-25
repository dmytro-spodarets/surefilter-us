-- CreateEnum
CREATE TYPE "public"."ResourceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "public"."SectionType" ADD VALUE 'form_embed';

-- CreateTable
CREATE TABLE "public"."Form" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "successTitle" TEXT DEFAULT 'Thank You!',
    "successMessage" TEXT DEFAULT 'Your form has been submitted successfully.',
    "redirectUrl" TEXT,
    "webhookUrl" TEXT,
    "webhookHeaders" JSONB,
    "notifyEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "webhookSent" BOOLEAN NOT NULL DEFAULT false,
    "webhookError" TEXT,
    "webhookResponse" JSONB,
    "webhookAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastWebhookTry" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResourceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "thumbnailImage" TEXT,
    "file" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" TEXT,
    "fileMeta" TEXT,
    "categoryId" TEXT NOT NULL,
    "formId" TEXT,
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_slug_key" ON "public"."Form"("slug");

-- CreateIndex
CREATE INDEX "Form_slug_idx" ON "public"."Form"("slug");

-- CreateIndex
CREATE INDEX "Form_isActive_idx" ON "public"."Form"("isActive");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_createdAt_idx" ON "public"."FormSubmission"("formId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FormSubmission_createdAt_idx" ON "public"."FormSubmission"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "FormSubmission_webhookSent_idx" ON "public"."FormSubmission"("webhookSent");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_name_key" ON "public"."ResourceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_slug_key" ON "public"."ResourceCategory"("slug");

-- CreateIndex
CREATE INDEX "ResourceCategory_position_idx" ON "public"."ResourceCategory"("position");

-- CreateIndex
CREATE INDEX "ResourceCategory_isActive_idx" ON "public"."ResourceCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "public"."Resource"("slug");

-- CreateIndex
CREATE INDEX "Resource_categoryId_idx" ON "public"."Resource"("categoryId");

-- CreateIndex
CREATE INDEX "Resource_status_publishedAt_idx" ON "public"."Resource"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Resource_formId_idx" ON "public"."Resource"("formId");

-- AddForeignKey
ALTER TABLE "public"."FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource" ADD CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ResourceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource" ADD CONSTRAINT "Resource_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;
