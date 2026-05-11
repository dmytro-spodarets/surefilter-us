'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { getLayout } from '@/components/banners/layouts';
import type { PublicBanner } from '@/types/banners';

interface BannerLivePreviewProps {
  banner: PublicBanner;
}

/** Renders the chosen layout with current form data. Read-only — no interaction. */
export default function BannerLivePreview({ banner }: BannerLivePreviewProps) {
  const layout = getLayout(banner.layout);
  const Layout = layout.Component;
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Live Preview · {layout.name}
          </div>
          <button
            type="button"
            onClick={() => setFullOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-sure-blue-600 hover:text-sure-blue-700"
          >
            <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
            Full preview
          </button>
        </div>
        <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4">
          <Layout
            banner={banner}
            onCtaClick={() => undefined}
            onSubmit={async () => undefined}
            onDismiss={() => undefined}
            state="idle"
          />
        </div>
      </div>

      {fullOpen && <FullPreviewDialog banner={banner} onClose={() => setFullOpen(false)} />}
    </>
  );
}

/**
 * Renders the layout inside a native <dialog> at its real production size.
 * No-op interaction callbacks — admin preview only.
 */
function FullPreviewDialog({ banner, onClose }: { banner: PublicBanner; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layout = getLayout(banner.layout);
  const Layout = layout.Component;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        /* noop */
      }
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={handleCancel}
      aria-label="Full banner preview"
      className="bg-transparent p-0 m-auto backdrop:bg-black/60 backdrop:backdrop-blur-sm w-full max-w-4xl"
    >
      <Layout
        banner={banner}
        onCtaClick={() => undefined}
        onSubmit={async () => undefined}
        onDismiss={onClose}
        state="idle"
      />
    </dialog>
  );
}
