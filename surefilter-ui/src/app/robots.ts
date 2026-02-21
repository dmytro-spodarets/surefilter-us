import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';
  const settings = await getSiteSettings();

  if (settings.seoRobotsBlock) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/catalog-viewer'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
