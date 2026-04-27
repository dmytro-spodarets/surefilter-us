'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { PublicBanner } from '@/types/banners';
import type { BannerLayoutState } from './layouts/types';
import { BannerModal } from './BannerModal';
import { getOrCreateSessionId, isDismissed, markDismissed } from './banner-storage';
import { matchesPath, matchesUtm, matchesReferer, pathnameToSlug } from './banner-targeting';
import { trackPopupOpen, trackButtonClick, trackEvent } from '@/lib/analytics';

function buildContextPayload(pathname: string, search: URLSearchParams) {
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = search.get(key);
    if (v) utm[key] = v;
  }
  return {
    pageUrl: typeof window !== 'undefined' ? window.location.href : null,
    pageSlug: pathnameToSlug(pathname),
    utmParams: Object.keys(utm).length ? utm : null,
    referer: typeof document !== 'undefined' ? document.referrer : null,
    sessionId: getOrCreateSessionId(),
  };
}

function pickBanner(banners: PublicBanner[], pathname: string, search: URLSearchParams, referer: string): PublicBanner | null {
  const eligible = banners.filter((b) => {
    if (!matchesPath(b, pathname)) return false;
    if (!matchesUtm(b.utmRules, search)) return false;
    if (!matchesReferer(b.refererRules, referer)) return false;
    if (isDismissed(b.id, b.dismissMode, b.dismissTtlDays)) return false;
    return true;
  });
  return eligible[0] || null;
}

function postBeacon(url: string, payload: Record<string, unknown>) {
  try {
    const data = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon(url, data)) return;
  } catch { /* fall through */ }
  // Fallback to fetch keepalive
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export default function BannerHost() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeBanner, setActiveBanner] = useState<PublicBanner | null>(null);
  const [state, setState] = useState<BannerLayoutState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const fetchedRef = useRef(false);
  const bannersRef = useRef<PublicBanner[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Skip on admin pages
  const skip = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  useEffect(() => {
    if (skip) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch('/api/banners/active')
      .then((r) => (r.ok ? r.json() : { banners: [] }))
      .then((data: { banners: PublicBanner[] }) => {
        bannersRef.current = data.banners || [];
        scheduleBanner();
      })
      .catch(() => undefined);

    function scheduleBanner() {
      const referer = typeof document !== 'undefined' ? document.referrer : '';
      const params = new URLSearchParams(searchParams?.toString() || '');
      const banner = pickBanner(bannersRef.current, pathname || '/', params, referer);
      if (!banner) return;

      timeoutRef.current = setTimeout(() => {
        setActiveBanner(banner);
        const ctx = buildContextPayload(pathname || '/', params);
        postBeacon(`/api/banners/${banner.id}/impression`, ctx);
        trackPopupOpen(banner.slug);
        trackEvent('banner_impression', {
          banner_slug: banner.slug,
          banner_type: banner.type,
          banner_layout: banner.layout,
          campaign_id: banner.campaignId || '',
        });
      }, banner.delayMs);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // We only want this to run on mount; pathname change is handled separately below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-evaluate on client-side route change (after initial fetch)
  useEffect(() => {
    if (skip) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setActiveBanner(null);
      return;
    }
    if (!fetchedRef.current || activeBanner) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const referer = typeof document !== 'undefined' ? document.referrer : '';
    const params = new URLSearchParams(searchParams?.toString() || '');
    const banner = pickBanner(bannersRef.current, pathname || '/', params, referer);
    if (!banner) return;

    timeoutRef.current = setTimeout(() => {
      setActiveBanner(banner);
      const ctx = buildContextPayload(pathname || '/', params);
      postBeacon(`/api/banners/${banner.id}/impression`, ctx);
      trackPopupOpen(banner.slug);
      trackEvent('banner_impression', {
        banner_slug: banner.slug,
        banner_type: banner.type,
        banner_layout: banner.layout,
        campaign_id: banner.campaignId || '',
      });
    }, banner.delayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, searchParams, skip, activeBanner]);

  // Cross-tab dismiss: if another tab dismisses this banner, close it here too
  useEffect(() => {
    if (!activeBanner) return;
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === `sf_banner_dismissed_${activeBanner.id}` && e.newValue) {
        setActiveBanner(null);
        setState('idle');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [activeBanner]);

  if (!activeBanner || skip) return null;

  const handleDismiss = () => {
    markDismissed(activeBanner.id, activeBanner.dismissMode);
    setActiveBanner(null);
    setState('idle');
  };

  const handleCtaClick = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const ctx = buildContextPayload(pathname || '/', params);
    postBeacon(`/api/banners/${activeBanner.id}/click`, { ...ctx, clickedUrl: activeBanner.ctaUrl });
    trackButtonClick(`banner:${activeBanner.slug}`, activeBanner.ctaUrl || undefined);
    trackEvent('banner_click', {
      banner_slug: activeBanner.slug,
      banner_type: activeBanner.type,
      banner_layout: activeBanner.layout,
      campaign_id: activeBanner.campaignId || '',
    });
    markDismissed(activeBanner.id, activeBanner.dismissMode);

    if (activeBanner.ctaUrl) {
      if (activeBanner.ctaOpenInNewTab) {
        window.open(activeBanner.ctaUrl, '_blank', 'noopener,noreferrer');
        setActiveBanner(null);
      } else {
        window.location.href = activeBanner.ctaUrl;
      }
    } else {
      setActiveBanner(null);
    }
  };

  const handleSubmit = async (email: string) => {
    setState('submitting');
    setErrorMessage(undefined);
    try {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const ctx = buildContextPayload(pathname || '/', params);
      const res = await fetch(`/api/banners/${activeBanner.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ctx, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data?.error || 'Submission failed');
        setState('error');
        return;
      }
      setState('success');
      trackEvent('banner_lead_submit', {
        banner_slug: activeBanner.slug,
        banner_layout: activeBanner.layout,
        campaign_id: activeBanner.campaignId || '',
      });
      markDismissed(activeBanner.id, activeBanner.dismissMode);
    } catch {
      setErrorMessage('Network error. Please try again.');
      setState('error');
    }
  };

  return (
    <BannerModal
      banner={activeBanner}
      onCtaClick={handleCtaClick}
      onSubmit={handleSubmit}
      onDismiss={handleDismiss}
      state={state}
      errorMessage={errorMessage}
    />
  );
}
