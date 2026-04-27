'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { BannerLayoutMeta, BannerLayoutProps } from './types';

export const minimalTextMeta: Omit<BannerLayoutMeta, 'Component'> = {
  id: 'minimal_text',
  name: 'Minimal Text',
  description: 'No image — title, body, and CTA only. Compact, perfect for subtle messages.',
  thumbnail: '/images/banner-layouts/minimal_text.svg',
  supportedTypes: ['LEAD_CAPTURE', 'CTA'],
};

export function MinimalTextLayout({ banner, onCtaClick, onSubmit, onDismiss, state, errorMessage }: BannerLayoutProps) {
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
    <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8" style={{ backgroundColor: bg, color: text }}>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close"
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 bg-black/10 hover:bg-black/20 text-current transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      <h2 className="text-2xl font-bold mb-3 pr-8">{banner.title}</h2>
      {banner.body && <p className="text-sm mb-5 opacity-90 whitespace-pre-line">{banner.body}</p>}

      {state === 'success' ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">{banner.successTitle || 'Thanks!'}</h3>
          {banner.successMessage && <p className="text-sm opacity-80 whitespace-pre-line">{banner.successMessage}</p>}
        </div>
      ) : banner.type === 'LEAD_CAPTURE' ? (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={banner.emailPlaceholder || 'Enter your email'}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 text-gray-900 text-sm"
              style={{ '--tw-ring-color': accent } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-60"
              style={{ backgroundColor: accent }}
            >
              {state === 'submitting' ? '...' : banner.submitLabel || 'Subscribe'}
            </button>
          </div>
          {state === 'error' && errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </form>
      ) : (
        <button
          type="button"
          onClick={onCtaClick}
          className="px-5 py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {banner.ctaLabel || 'Learn More'}
        </button>
      )}
    </div>
  );
}
