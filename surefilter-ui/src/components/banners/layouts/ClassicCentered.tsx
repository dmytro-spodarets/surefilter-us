'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import type { BannerLayoutMeta, BannerLayoutProps } from './types';

export const classicCenteredMeta: Omit<BannerLayoutMeta, 'Component'> = {
  id: 'classic_centered',
  name: 'Classic Centered',
  description: 'Image on top, title and content centered below. Universal layout for both types.',
  thumbnail: '/images/banner-layouts/classic_centered.svg',
  supportedTypes: ['LEAD_CAPTURE', 'CTA'],
};

export function ClassicCenteredLayout({ banner, onCtaClick, onSubmit, onDismiss, state, errorMessage }: BannerLayoutProps) {
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
    <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: bg, color: text }}>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close"
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/10 hover:bg-black/20 text-current transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      {banner.imageUrl && (
        <div className="relative w-full aspect-[16/9]">
          <ManagedImage
            src={banner.imageUrl}
            alt={banner.imageAlt || ''}
            fill
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6 sm:p-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{banner.title}</h2>
        {banner.body && <p className="text-sm sm:text-base mb-6 opacity-90 whitespace-pre-line">{banner.body}</p>}

        {state === 'success' ? (
          <div className="py-4">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 text-gray-900"
              style={{ '--tw-ring-color': accent } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full px-4 py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: accent }}
            >
              {state === 'submitting' ? 'Sending...' : banner.submitLabel || 'Subscribe'}
            </button>
            {state === 'error' && errorMessage && (
              <p className="text-sm text-red-600 text-left">{errorMessage}</p>
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={onCtaClick}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {banner.ctaLabel || 'Learn More'}
          </button>
        )}
      </div>
    </div>
  );
}
