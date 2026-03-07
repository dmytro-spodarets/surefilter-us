'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    Termly?: {
      initialize: () => void;
    };
  }
}

/**
 * Reinitializes Termly on client-side navigation.
 * The Termly resource-blocker script itself is loaded via
 * <Script strategy="beforeInteractive"> in root layout.tsx
 * so it's the first script on the page.
 * This component only handles SPA route-change re-scanning.
 */
export default function TermlyCMP() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render — Termly already initialized when the script loaded
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window !== 'undefined' && window.Termly) {
      try {
        window.Termly.initialize();
      } catch (e) {
        console.warn('Error initializing Termly:', e);
      }
    }
  }, [pathname, searchParams]);

  return null;
}
