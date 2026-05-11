import 'server-only';
import { prisma } from '@/lib/prisma';
import type { PublicBanner, UtmRule, RefererRule } from '@/types/banners';
import type {
  ProductShowcaseConfig,
  ProductShowcaseEnrichedConfig,
  ProductShowcaseProductData,
} from '@/components/banners/layouts/product-showcase-schema';

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

  // Collect product IDs referenced by product_showcase banners so we can enrich layoutConfig with image/code data
  // in a single DB query before mapping rows.
  const showcaseProductIds = new Set<string>();
  for (const b of rows) {
    if (b.layout !== 'product_showcase' || !b.layoutConfig) continue;
    const cfg = b.layoutConfig as Partial<ProductShowcaseConfig>;
    for (const item of cfg.products || []) {
      if (item && typeof item.productId === 'string') showcaseProductIds.add(item.productId);
    }
  }

  let productDataMap: Record<string, ProductShowcaseProductData> = {};
  if (showcaseProductIds.size > 0) {
    try {
      const products = await prisma.product.findMany({
        where: { id: { in: Array.from(showcaseProductIds) } },
        select: {
          id: true,
          code: true,
          media: {
            select: { asset: { select: { cdnUrl: true } }, isPrimary: true, position: true },
            orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
            take: 1,
          },
        },
      });
      productDataMap = Object.fromEntries(
        products.map((p) => [
          p.id,
          { id: p.id, code: p.code, imageUrl: p.media[0]?.asset?.cdnUrl ?? null },
        ]),
      );
    } catch {
      productDataMap = {};
    }
  }

  const banners: PublicBanner[] = rows.map((b) => {
    let layoutConfig: unknown = b.layoutConfig ?? null;
    if (b.layout === 'product_showcase' && b.layoutConfig) {
      const cfg = b.layoutConfig as ProductShowcaseConfig;
      const enriched: ProductShowcaseEnrichedConfig = {
        ...cfg,
        productsData: Object.fromEntries(
          (cfg.products || [])
            .map((p) => p.productId)
            .filter((id): id is string => typeof id === 'string' && id in productDataMap)
            .map((id) => [id, productDataMap[id]]),
        ),
      };
      layoutConfig = enriched;
    }

    return {
      id: b.id,
      slug: b.slug,
      type: b.type,
      layout: b.layout,
      layoutConfig,
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
    };
  });

  cachedBanners = banners;
  cacheTimestamp = Date.now();
  return banners;
}
