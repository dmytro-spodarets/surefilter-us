import 'server-only';
import { prisma } from '@/lib/prisma';

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  statusCode: 301 | 302;
  isActive: boolean;
  comment?: string;
}

export interface NavigationChildItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
}

export interface NavigationItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  children?: NavigationChildItem[];
}

export interface SiteSettings {
  // Branding
  logoUrl?: string;

  // Newsroom
  newsroomTitle?: string;
  newsroomDescription?: string;
  newsroomHeroImage?: string;
  newsroomMetaTitle?: string;
  newsroomMetaDesc?: string;
  newsroomOgImage?: string;
  
  // News Article Page
  newsArticleTitle?: string;
  newsArticleDescription?: string;
  newsArticleHeroImage?: string;

  // Event Article Page
  eventArticleTitle?: string;
  eventArticleDescription?: string;
  eventArticleHeroImage?: string;

  // Resources
  resourcesTitle?: string;
  resourcesDescription?: string;
  resourcesHeroImage?: string;
  resourcesMetaTitle?: string;
  resourcesMetaDesc?: string;
  resourcesOgImage?: string;
  
  // Analytics
  gaMeasurementId?: string;
  gtmId?: string;
  termlyWebsiteUUID?: string;

  // SEO
  seoRobotsBlock?: boolean;
  llmsSiteDescription?: string;

  // Default SEO Meta
  defaultMetaTitle?: string;
  defaultMetaTitleSuffix?: string;
  defaultMetaDesc?: string;
  defaultMetaKeywords?: string;

  // Redirects
  redirects?: RedirectRule[];

  // Header Navigation
  headerNavigation?: NavigationItem[];
  
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

  let settings;
  try {
    settings = await prisma.siteSettings.findUnique({
      where: { id: 'site_settings' },
    });
  } catch {
    // DB unavailable (e.g., during build) — return empty settings
    return { headerNavigation: [], footerContent: {} };
  }

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
    logoUrl: settings.logoUrl || undefined,
    newsroomTitle: settings.newsroomTitle || undefined,
    newsroomDescription: settings.newsroomDescription || undefined,
    newsroomHeroImage: settings.newsroomHeroImage || undefined,
    newsroomMetaTitle: settings.newsroomMetaTitle || undefined,
    newsroomMetaDesc: settings.newsroomMetaDesc || undefined,
    newsroomOgImage: settings.newsroomOgImage || undefined,
    newsArticleTitle: settings.newsArticleTitle || undefined,
    newsArticleDescription: settings.newsArticleDescription || undefined,
    newsArticleHeroImage: settings.newsArticleHeroImage || undefined,
    eventArticleTitle: settings.eventArticleTitle || undefined,
    eventArticleDescription: settings.eventArticleDescription || undefined,
    eventArticleHeroImage: settings.eventArticleHeroImage || undefined,
    resourcesTitle: settings.resourcesTitle || undefined,
    resourcesDescription: settings.resourcesDescription || undefined,
    resourcesHeroImage: settings.resourcesHeroImage || undefined,
    resourcesMetaTitle: settings.resourcesMetaTitle || undefined,
    resourcesMetaDesc: settings.resourcesMetaDesc || undefined,
    resourcesOgImage: settings.resourcesOgImage || undefined,
    gaMeasurementId: settings.gaMeasurementId || undefined,
    gtmId: settings.gtmId || undefined,
    termlyWebsiteUUID: settings.termlyWebsiteUUID || undefined,
    seoRobotsBlock: settings.seoRobotsBlock,
    llmsSiteDescription: settings.llmsSiteDescription || undefined,
    defaultMetaTitle: settings.defaultMetaTitle || undefined,
    defaultMetaTitleSuffix: settings.defaultMetaTitleSuffix || undefined,
    defaultMetaDesc: settings.defaultMetaDesc || undefined,
    defaultMetaKeywords: settings.defaultMetaKeywords || undefined,
    redirects: settings.redirects as any,
    headerNavigation: settings.headerNavigation as any,
    footerContent: settings.footerContent as any,
  };

  cachedSettings = parsedSettings;
  cacheTimestamp = Date.now();
  
  return parsedSettings;
}

// Helper to get only navigation
export async function getHeaderNavigation(): Promise<NavigationItem[]> {
  const settings = await getSiteSettings();
  const items = settings.headerNavigation?.filter(item => item.isActive).sort((a, b) => a.order - b.order) || [];
  return items.map(item => ({
    ...item,
    children: item.children?.filter(c => c.isActive).sort((a, b) => a.order - b.order) || [],
  }));
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

// Helper to get news article page settings
export async function getNewsArticlePageSettings() {
  const settings = await getSiteSettings();
  return {
    newsTitle: settings.newsArticleTitle || 'News Article',
    newsDescription: settings.newsArticleDescription || 'Stay updated with the latest news from Sure Filter\u00AE',
    newsHeroImage: settings.newsArticleHeroImage,
    eventTitle: settings.eventArticleTitle || 'Event Details',
    eventDescription: settings.eventArticleDescription || 'Join us at our upcoming event',
    eventHeroImage: settings.eventArticleHeroImage,
  };
}

// Helper to get GA Measurement ID
export async function getGaMeasurementId(): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings.gaMeasurementId || undefined;
}

// Helper to get GTM Container ID
export async function getGtmId(): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings.gtmId || undefined;
}

// Helper to get Termly Website UUID
export async function getTermlyWebsiteUUID(): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings.termlyWebsiteUUID || undefined;
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

// Helper to get default SEO meta (used in root layout)
export async function getDefaultSeoMeta() {
  const settings = await getSiteSettings();
  return {
    title: settings.defaultMetaTitle,
    titleSuffix: settings.defaultMetaTitleSuffix,
    description: settings.defaultMetaDesc,
    keywords: settings.defaultMetaKeywords,
  };
}

// Helper to get logo URL (used by Header)
export async function getLogoUrl(): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings.logoUrl;
}

// Helper to get active redirects (used by /api/redirects for middleware)
export async function getActiveRedirects(): Promise<RedirectRule[]> {
  const settings = await getSiteSettings();
  return (settings.redirects || []).filter(r => r.isActive);
}

