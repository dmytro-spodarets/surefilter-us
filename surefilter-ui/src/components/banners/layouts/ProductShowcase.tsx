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
    <div className="relative bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
      {hasSpecial && (
        <span
          className="absolute -top-2 right-3 bg-red-600 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm uppercase z-10"
          aria-label="Special offer"
        >
          {item.specialBadge}
        </span>
      )}

      <div
        className="text-white font-bold text-base sm:text-lg tracking-wide rounded px-3 py-1.5 text-center mb-3"
        style={{ backgroundColor: accent }}
      >
        {code}
      </div>

      <div className="flex gap-3 mb-3">
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

        <div className="flex-1 text-xs sm:text-[13px] text-gray-700 leading-snug">
          {item.description && <p className="mb-2">{item.description}</p>}
          {cfg.showApplication && item.applicationText && (
            <p className="text-gray-600">{item.applicationText}</p>
          )}
        </div>
      </div>

      {cfg.showCrossRefs && item.crossRefs && item.crossRefs.length > 0 && (
        <div className="border-t border-gray-100 pt-2 mb-2">
          <p className="text-xs font-semibold text-gray-800 mb-1">Cross References</p>
          <ul className="space-y-0.5">
            {item.crossRefs.map((ref, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-gray-600">
                <span className="font-medium text-gray-800">{ref.brand}</span>
                <span className="text-gray-400"> : </span>
                <span>{ref.codes}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-2 border-t border-gray-100 flex items-end justify-between gap-3">
        {cfg.showMoqCont && (item.moq || item.cont) && (
          <div className="text-[11px] text-gray-600 leading-tight">
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
          <div className={`text-right font-bold leading-tight ${hasSpecial ? 'text-red-600' : ''}`} style={hasSpecial ? undefined : { color: accent }}>
            {item.priceText && <p className="text-sm sm:text-base">{item.priceText}</p>}
            {item.pricePerCaseText && <p className="text-xs sm:text-sm">{item.pricePerCaseText}</p>}
          </div>
        )}
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
      className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden bg-white text-gray-900"
      role="document"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close popup"
        className="absolute top-2 right-2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Header strip */}
      <div
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: accent }}
      >
        {banner.imageUrl ? (
          <div className="relative w-full aspect-[16/5] sm:aspect-[16/4]">
            <ManagedImage
              src={banner.imageUrl}
              alt={banner.imageAlt || ''}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-[16/5] sm:aspect-[16/4]" />
        )}

        <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8">
          {(cfg.overlayHeadlineAccent || cfg.overlayHeadlineRest) && (
            <h2 className="text-xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow">
              {cfg.overlayHeadlineAccent && (
                <span style={{ color: accentOrange }}>{cfg.overlayHeadlineAccent}</span>
              )}
              {cfg.overlayHeadlineAccent && cfg.overlayHeadlineRest && ' '}
              {cfg.overlayHeadlineRest && <span>{cfg.overlayHeadlineRest}</span>}
            </h2>
          )}
          {cfg.overlaySubtitle && (
            <p className="text-xs sm:text-base text-white/90 mt-1 max-w-xl drop-shadow">{cfg.overlaySubtitle}</p>
          )}
        </div>
      </div>

      {/* Product cards */}
      <div className="bg-stone-50 p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            No products configured. Add products in the admin to populate this banner.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <div className="bg-white border-t border-gray-200 px-5 sm:px-6 py-4">
        {state === 'success' ? (
          <div className="text-center">
            <h3 className="text-base font-semibold mb-1">{banner.successTitle || 'Thanks!'}</h3>
            {banner.successMessage && (
              <p className="text-sm text-gray-600 whitespace-pre-line">{banner.successMessage}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-700 leading-tight flex-1">
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
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 text-sm text-gray-900"
                    style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  />
                  <button
                    type="submit"
                    disabled={state === 'submitting'}
                    className="shrink-0 px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-60 inline-flex items-center gap-1.5 min-h-[44px]"
                    style={{ backgroundColor: accent }}
                  >
                    {state === 'submitting' ? 'Sending…' : banner.submitLabel || 'Get full catalog'}
                    <span aria-hidden>→</span>
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500">No spam. Unsubscribe anytime.</p>
                {state === 'error' && errorMessage && (
                  <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                )}
              </form>
            ) : (
              <button
                type="button"
                onClick={onCtaClick}
                className="shrink-0 px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-90 inline-flex items-center gap-2 min-h-[44px]"
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
  );
}
