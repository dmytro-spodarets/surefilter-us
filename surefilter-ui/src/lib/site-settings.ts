import { prisma } from '@/lib/prisma';

export interface SiteSettings {
  // Newsroom
  newsroomTitle?: string;
  newsroomDescription?: string;
  newsroomHeroImage?: string;
  newsroomMetaTitle?: string;
  newsroomMetaDesc?: string;
  newsroomOgImage?: string;
  
  // Resources
  resourcesTitle?: string;
  resourcesDescription?: string;
  resourcesHeroImage?: string;
  resourcesMetaTitle?: string;
  resourcesMetaDesc?: string;
  resourcesOgImage?: string;
  
  // Header Navigation
  headerNavigation?: Array<{
    label: string;
    url: string;
    order: number;
    isActive: boolean;
  }>;
  
  // Footer
  footerContent?: {
    description?: string;
    address?: string[];
    phone?: string;
    fax?: string;
    phoneTollFree?: string;
    aiAgent?: string;
    email?: string;
    companyLinks?: Array<{ name: string; href: string }>;
    socialLinks?: Array<{ name: string; href: string }>;
    appLinks?: {
      appStore?: string;
      googlePlay?: string;
    };
    copyright?: string;
    legalLinks?: Array<{ name: string; href: string }>;
  };
}

// Cache for site settings (revalidate every 1 minute in production)
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

// Function to clear cache (called when settings are updated)
export function clearSiteSettingsCache() {
  cachedSettings = null;
  cacheTimestamp = 0;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  // Use cache in production if fresh
  if (process.env.NODE_ENV === 'production' && cachedSettings && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedSettings;
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'site_settings' },
  });

  if (!settings) {
    // Return minimal empty settings - admin can fill them in admin panel
    const emptySettings: SiteSettings = {
      headerNavigation: [],
      footerContent: {},
    };
    return emptySettings;
  }

  // Parse JSON fields
  const parsedSettings: SiteSettings = {
    newsroomTitle: settings.newsroomTitle || undefined,
    newsroomDescription: settings.newsroomDescription || undefined,
    newsroomHeroImage: settings.newsroomHeroImage || undefined,
    newsroomMetaTitle: settings.newsroomMetaTitle || undefined,
    newsroomMetaDesc: settings.newsroomMetaDesc || undefined,
    newsroomOgImage: settings.newsroomOgImage || undefined,
    resourcesTitle: settings.resourcesTitle || undefined,
    resourcesDescription: settings.resourcesDescription || undefined,
    resourcesHeroImage: settings.resourcesHeroImage || undefined,
    resourcesMetaTitle: settings.resourcesMetaTitle || undefined,
    resourcesMetaDesc: settings.resourcesMetaDesc || undefined,
    resourcesOgImage: settings.resourcesOgImage || undefined,
    headerNavigation: settings.headerNavigation as any,
    footerContent: settings.footerContent as any,
  };

  cachedSettings = parsedSettings;
  cacheTimestamp = Date.now();
  
  return parsedSettings;
}

// Helper to get only navigation
export async function getHeaderNavigation() {
  const settings = await getSiteSettings();
  return settings.headerNavigation?.filter(item => item.isActive).sort((a, b) => a.order - b.order) || [];
}

// Helper to get only footer
export async function getFooterContent() {
  const settings = await getSiteSettings();
  return settings.footerContent || {};
}

// Helper to get newsroom page settings
export async function getNewsroomPageSettings() {
  const settings = await getSiteSettings();
  return {
    title: settings.newsroomTitle || 'Newsroom',
    description: settings.newsroomDescription || 'Stay updated with our upcoming events, exhibitions, and latest press releases.',
    heroImage: settings.newsroomHeroImage,
    metaTitle: settings.newsroomMetaTitle,
    metaDescription: settings.newsroomMetaDesc,
    ogImage: settings.newsroomOgImage,
  };
}

// Helper to get resources page settings
export async function getResourcesPageSettings() {
  const settings = await getSiteSettings();
  return {
    title: settings.resourcesTitle || 'Resources',
    description: settings.resourcesDescription || 'Access technical documentation, installation guides, product catalogs, and educational materials.',
    heroImage: settings.resourcesHeroImage,
    metaTitle: settings.resourcesMetaTitle,
    metaDescription: settings.resourcesMetaDesc,
    ogImage: settings.resourcesOgImage,
  };
}

