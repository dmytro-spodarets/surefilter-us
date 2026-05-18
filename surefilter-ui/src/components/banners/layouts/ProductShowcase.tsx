'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import type { BannerLayoutMeta, BannerLayoutProps } from './types';
import type {
  ProductShowcaseEnrichedConfig,
  ProductShowcaseItem,
  ProductShowcaseProductData,
} from './product-showcase-schema';

export const productShowcaseMeta: Omit<BannerLayoutMeta, 'Component'> = {
  id: 'product_showcase',
  name: 'Product Showcase (2 cards)',
  description:
    'Header strip with split-color headline, two product cards with SKU, image, fits, cross-refs, MOQ/CONT and pricing. Footer with CTA or email capture.',
  thumbnail: '/images/banner-layouts/product_showcase.svg',
  supportedTypes: ['LEAD_CAPTURE', 'CTA'],
};

const DEFAULT_CONFIG: ProductShowcaseEnrichedConfig = {
  products: [],
  showImage: true,
  showApplication: true,
  showCrossRefs: true,
  showMoqCont: true,
  showPrice: true,
};

function getConfig(raw: unknown): ProductShowcaseEnrichedConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...(raw as ProductShowcaseEnrichedConfig) };
}

function ProductCard({
  item,
  data,
  accent,
  cfg,
}: {
  item: ProductShowcaseItem;
  data: ProductShowcaseProductData | undefined;
  accent: string;
  cfg: ProductShowcaseEnrichedConfig;
}) {
  const code = data?.code || 'CODE';
  const hasSpecial = !!(item.specialBadge && item.specialBadge.trim());

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-col">
      {hasSpecial && (
        <span
          className="absolute -top-2 right-3 bg-red-600 text-white text-[11px] sm:text-xs font-bold tracking-wider px-2 py-0.5 rounded shadow-sm uppercase z-10"
          aria-label="Special offer"
        >
          {item.specialBadge}
        </span>
      )}

      <div
        className="text-white font-bold text-lg sm:text-xl tracking-wide rounded px-3 py-1.5 text-center mb-2 sm:mb-3"
        style={{ backgroundColor: accent }}
      >
        {code}
      </div>

      <div className="flex gap-3 mb-2 sm:mb-3">
        {cfg.showImage && (
          <div className="relative w-20 sm:w-24 aspect-square shrink-0 bg-gray-50 rounded border border-gray-100 overflow-hidden">
            {data?.imageUrl ? (
              <ManagedImage
                src={data.imageUrl}
                alt={code}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-contain p-1"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
            )}
          </div>
        )}

        <div className="flex-1 text-sm sm:text-base text-gray-700 leading-snug">
          {item.description && <p className="mb-1 sm:mb-2">{item.description}</p>}
          {cfg.showApplication && item.applicationText && (
            <p className="text-gray-600">{item.applicationText}</p>
          )}
        </div>
      </div>

      {/* Cross refs (left) + MOQ/CONT + price (right) share one horizontal strip to keep the card compact */}
      <div className="mt-auto pt-2 border-t border-gray-100 flex items-start justify-between gap-3">
        {cfg.showCrossRefs && item.crossRefs && item.crossRefs.length > 0 ? (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 mb-1">Cross References</p>
            <ul className="space-y-0.5">
              {item.crossRefs.map((ref, i) => (
                <li key={i} className="text-xs text-gray-600 leading-snug">
                  <span className="font-medium text-gray-800">{ref.brand}</span>
                  <span className="text-gray-400"> : </span>
                  <span>{ref.codes}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="shrink-0 text-right space-y-1.5">
          {cfg.showMoqCont && (item.moq || item.cont) && (
            <div className="text-xs text-gray-600 leading-tight">
              {item.moq && (
                <p>
                  <span className="font-semibold text-gray-800">MOQ:</span> {item.moq}
                </p>
              )}
              {item.cont && (
                <p>
                  <span className="font-semibold text-gray-800">CONT:</span> {item.cont}
                </p>
              )}
            </div>
          )}
          {cfg.showPrice && (item.priceText || item.pricePerCaseText) && (
            <div className={`font-bold leading-tight ${hasSpecial ? 'text-red-600' : ''}`} style={hasSpecial ? undefined : { color: accent }}>
              {item.priceText && <p className="text-sm sm:text-base">{item.priceText}</p>}
              {item.pricePerCaseText && <p className="text-xs sm:text-sm">{item.pricePerCaseText}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductShowcaseLayout({ banner, onCtaClick, onSubmit, onDismiss, state, errorMessage }: BannerLayoutProps) {
  const [email, setEmail] = useState('');
  const cfg = getConfig(banner.layoutConfig);
  const accent = banner.accentColor || '#1D2475';
  const accentOrange = '#F26522'; // Sure orange for headline accent word

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onSubmit(email.trim());
  };

  const items = cfg.products.slice(0, 2);

  return (
    <div
      className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden bg-white text-gray-900 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh]"
      role="document"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close popup"
        className="absolute top-2 right-2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Scrollable inner — keeps the close button anchored on tall mobile viewports */}
      <div className="overflow-y-auto overscroll-contain">
        {/* Header strip */}
        <div
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: accent }}
        >
          {banner.imageUrl ? (
            <div className="relative w-full aspect-[16/7] sm:aspect-[16/4]">
              <ManagedImage
                src={banner.imageUrl}
                alt={banner.imageAlt || ''}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full aspect-[16/7] sm:aspect-[16/4]" />
          )}

          <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8">
            {(cfg.overlayHeadlineAccent || cfg.overlayHeadlineRest) && (
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white drop-shadow">
                {cfg.overlayHeadlineAccent && (
                  <span style={{ color: accentOrange }}>{cfg.overlayHeadlineAccent}</span>
                )}
                {cfg.overlayHeadlineAccent && cfg.overlayHeadlineRest && ' '}
                {cfg.overlayHeadlineRest && <span>{cfg.overlayHeadlineRest}</span>}
              </h2>
            )}
            {cfg.overlaySubtitle && (
              <p className="text-sm sm:text-lg text-white/95 mt-1.5 max-w-xl drop-shadow">{cfg.overlaySubtitle}</p>
            )}
          </div>
        </div>

        {/* Product cards */}
        <div className="bg-stone-50 p-3 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">
              No products configured. Add products in the admin to populate this banner.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {items.map((item, i) => (
                <ProductCard
                  key={item.productId || `slot-${i}`}
                  item={item}
                  data={cfg.productsData?.[item.productId]}
                  accent={accent}
                  cfg={cfg}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          {state === 'success' ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">{banner.successTitle || 'Thanks!'}</h3>
              {banner.successMessage && (
                <p className="text-base text-gray-600 whitespace-pre-line">{banner.successMessage}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="text-sm sm:text-base text-gray-700 leading-tight flex-1">
                {cfg.footerStockText && <p className="font-semibold text-gray-900">{cfg.footerStockText}</p>}
                {cfg.footerBrandsText && <p className="text-gray-600">{cfg.footerBrandsText}</p>}
              </div>

              {banner.type === 'LEAD_CAPTURE' ? (
                <form onSubmit={handleSubmit} noValidate className="flex-1 sm:max-w-md">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={banner.emailPlaceholder || 'you@business.com'}
                      className="flex-1 min-w-0 px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 text-base text-gray-900"
                      style={{ '--tw-ring-color': accent } as React.CSSProperties}
                    />
                    <button
                      type="submit"
                      disabled={state === 'submitting'}
                      className="shrink-0 px-4 py-3 rounded-lg font-semibold text-white text-sm sm:text-base transition-opacity disabled:opacity-60 inline-flex items-center gap-1.5 min-h-[44px]"
                      style={{ backgroundColor: accent }}
                    >
                      {state === 'submitting' ? 'Sending…' : banner.submitLabel || 'Get full catalog'}
                      <span aria-hidden>→</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
                  {state === 'error' && errorMessage && (
                    <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="shrink-0 px-5 py-3 rounded-lg font-semibold text-white text-sm sm:text-base transition-opacity hover:opacity-90 inline-flex items-center gap-2 min-h-[44px]"
                  style={{ backgroundColor: accent }}
                >
                  {banner.ctaLabel || 'See all filters'}
                  <span aria-hidden>→</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
