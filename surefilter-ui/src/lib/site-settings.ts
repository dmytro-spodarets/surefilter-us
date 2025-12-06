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

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'site_settings' },
    });

    if (!settings) {
      // Return defaults if no settings found
      const defaults: SiteSettings = {
        newsroomTitle: 'Newsroom',
        newsroomDescription: 'Stay updated with our upcoming events, exhibitions, and latest press releases.',
        resourcesTitle: 'Resources',
        resourcesDescription: 'Access technical documentation, installation guides, product catalogs, and educational materials.',
        headerNavigation: [
          { label: 'HOME', url: '/', order: 0, isActive: true },
          { label: 'HEAVY DUTY', url: '/heavy-duty', order: 1, isActive: true },
          { label: 'AUTOMOTIVE', url: '/automotive', order: 2, isActive: true },
          { label: 'INDUSTRIES', url: '/industries', order: 3, isActive: true },
          { label: 'ABOUT US', url: '/about-us', order: 4, isActive: true },
          { label: 'CONTACT US', url: '/contact-us', order: 5, isActive: true },
        ],
        footerContent: {
          description: 'Your trusted partner for superior filtration solutions. Premium quality, performance, and reliability for the world\'s toughest applications.',
          address: ['1470 Civic Dr. STE 309', 'Concord, CA 94520'],
          phone: '+1 (925) 566-8863/73',
          fax: '+1 (925) 566-8893',
          phoneTollFree: '+1 8448 BE SURE',
          aiAgent: 'Phil, our AI Service Agent: +1-651-273-9232',
          email: 'order@surefilter.us',
          companyLinks: [
            { name: 'About Us', href: '/about-us' },
            { name: 'Contact Us', href: '/contact-us' },
            { name: 'Newsroom', href: '/newsroom' },
            { name: 'Warranty', href: '/warranty' },
            { name: 'Resources', href: '/resources' },
            { name: 'Catalog', href: '/catalog' },
          ],
          socialLinks: [
            { name: 'LinkedIn', href: '#' },
            { name: 'Facebook', href: '#' },
          ],
          appLinks: {
            appStore: '#',
            googlePlay: '#',
          },
          copyright: '© 2025 Sure Filter®. All rights reserved.',
          legalLinks: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Use', href: '/terms' },
          ],
        },
      };
      
      cachedSettings = defaults;
      cacheTimestamp = Date.now();
      return defaults;
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
  } catch (error) {
    console.error('Error fetching site settings:', error);
    
    // Return defaults on error
    return {
      newsroomTitle: 'Newsroom',
      resourcesTitle: 'Resources',
      headerNavigation: [],
      footerContent: {},
    };
  }
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

