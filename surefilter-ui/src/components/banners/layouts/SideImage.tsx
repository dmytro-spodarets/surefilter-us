'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import type { BannerLayoutMeta, BannerLayoutProps } from './types';

export const sideImageMeta: Omit<BannerLayoutMeta, 'Component'> = {
  id: 'side_image',
  name: 'Side Image',
  description: 'Image on the left, content on the right. Wider modal — better for longer copy.',
  thumbnail: '/images/banner-layouts/side_image.svg',
  supportedTypes: ['LEAD_CAPTURE', 'CTA'],
};

export function SideImageLayout({ banner, onCtaClick, onSubmit, onDismiss, state, errorMessage }: BannerLayoutProps) {
  const [email, setEmail] = useState('');
  const accent = banner.accentColor || '#1D2475';
  const bg = banner.backgroundColor || '#ffffff';
  const text = banner.textColor || '#0f172a';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onSubmit(email.trim());
  };

  return (
    <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2" style={{ backgroundColor: bg, color: text }}>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close"
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/10 hover:bg-black/20 text-current transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      {banner.imageUrl && (
        <div className="relative aspect-square sm:aspect-auto">
          <ManagedImage
            src={banner.imageUrl}
            alt={banner.imageAlt || ''}
            fill
            sizes="(max-width: 640px) 100vw, 336px"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col justify-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-3">{banner.title}</h2>
        {banner.body && <p className="text-sm mb-5 opacity-90 whitespace-pre-line">{banner.body}</p>}

        {state === 'success' ? (
          <div>
            <h3 className="text-lg font-semibold mb-2">{banner.successTitle || 'Thanks!'}</h3>
            {banner.successMessage && <p className="text-sm opacity-80 whitespace-pre-line">{banner.successMessage}</p>}
          </div>
        ) : banner.type === 'LEAD_CAPTURE' ? (
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={banner.emailPlaceholder || 'Enter your email'}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 text-gray-900"
              style={{ '--tw-ring-color': accent } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full px-4 py-2.5 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: accent }}
            >
              {state === 'submitting' ? 'Sending...' : banner.submitLabel || 'Subscribe'}
            </button>
            {state === 'error' && errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={onCtaClick}
            className="self-start px-5 py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {banner.ctaLabel || 'Learn More'}
          </button>
        )}
      </div>
    </div>
  );
}
