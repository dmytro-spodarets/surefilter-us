import 'server-only';
import { prisma } from '@/lib/prisma';
import type { PublicBanner, UtmRule, RefererRule } from '@/types/banners';

let cachedBanners: PublicBanner[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 1 min

export function clearBannersCache() {
  cachedBanners = null;
  cacheTimestamp = 0;
}

export async function getActiveBanners(): Promise<PublicBanner[]> {
  if (process.env.NODE_ENV === 'production' && cachedBanners && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedBanners;
  }

  let rows;
  try {
    const now = new Date();
    rows = await prisma.banner.findMany({
      where: {
        status: 'PUBLISHED',
        AND: [
          { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
      },
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });
  } catch {
    return [];
  }

  const banners: PublicBanner[] = rows.map((b) => ({
    id: b.id,
    slug: b.slug,
    type: b.type,
    layout: b.layout,
    accentColor: b.accentColor,
    backgroundColor: b.backgroundColor,
    textColor: b.textColor,
    title: b.title,
    body: b.body,
    imageUrl: b.imageUrl,
    imageAlt: b.imageAlt,
    ctaLabel: b.ctaLabel,
    ctaUrl: b.ctaUrl,
    ctaOpenInNewTab: b.ctaOpenInNewTab,
    emailPlaceholder: b.emailPlaceholder,
    submitLabel: b.submitLabel,
    successTitle: b.successTitle,
    successMessage: b.successMessage,
    targetAllPages: b.targetAllPages,
    targetSlugs: b.targetSlugs,
    excludeSlugs: b.excludeSlugs,
    delayMs: b.delayMs,
    utmRules: b.utmRules as UtmRule[] | null,
    refererRules: b.refererRules as RefererRule[] | null,
    dismissMode: b.dismissMode,
    dismissTtlDays: b.dismissTtlDays,
    priority: b.priority,
    campaignId: b.campaignId,
  }));

  cachedBanners = banners;
  cacheTimestamp = Date.now();
  return banners;
}
