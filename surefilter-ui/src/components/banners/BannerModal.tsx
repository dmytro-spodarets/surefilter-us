'use client';

import { useEffect, useRef } from 'react';
import { getLayout } from './layouts';
import type { BannerLayoutState } from './layouts/types';
import type { PublicBanner } from '@/types/banners';

interface BannerModalProps {
  banner: PublicBanner;
  onCtaClick: () => void;
  onSubmit: (email: string) => Promise<void>;
  onDismiss: () => void;
  state: BannerLayoutState;
  errorMessage?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function BannerModal({ banner, onCtaClick, onSubmit, onDismiss, state, errorMessage }: BannerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layout = getLayout(banner.layout);
  const Layout = layout.Component;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      const open = () => {
        try { dialog.showModal(); } catch { /* noop */ }
      };
      // View Transitions API for entrance — graceful fallback if unsupported or reduced-motion
      const vt = (document as any).startViewTransition;
      if (typeof vt === 'function' && !prefersReducedMotion()) {
        vt.call(document, open);
      } else {
        open();
      }
    }
  }, []);

  // Close on backdrop click
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onDismiss();
  };

  // Close on Escape — native <dialog> behaviour, but we need to fire dismiss
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onDismiss();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={handleCancel}
      style={{ viewTransitionName: 'sf-banner-modal' } as React.CSSProperties}
      className="bg-transparent p-0 m-auto backdrop:bg-black/50 backdrop:backdrop-blur-sm w-full max-w-4xl"
    >
      <Layout
        banner={banner}
        onCtaClick={onCtaClick}
        onSubmit={onSubmit}
        onDismiss={onDismiss}
        state={state}
        errorMessage={errorMessage}
      />
    </dialog>
  );
}
