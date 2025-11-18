-- CreateTable
CREATE TABLE "public"."SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site_settings',
    "newsroomTitle" TEXT DEFAULT 'Newsroom',
    "newsroomDescription" TEXT,
    "newsroomHeroImage" TEXT,
    "newsroomMetaTitle" TEXT,
    "newsroomMetaDesc" TEXT,
    "newsroomOgImage" TEXT,
    "resourcesTitle" TEXT DEFAULT 'Resources',
    "resourcesDescription" TEXT,
    "resourcesHeroImage" TEXT,
    "resourcesMetaTitle" TEXT,
    "resourcesMetaDesc" TEXT,
    "resourcesOgImage" TEXT,
    "headerNavigation" JSONB,
    "footerContent" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
