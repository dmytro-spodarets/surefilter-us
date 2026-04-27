'use client';

import { getLayout } from '@/components/banners/layouts';
import type { PublicBanner } from '@/types/banners';

interface BannerLivePreviewProps {
  banner: PublicBanner;
}

/** Renders the chosen layout with current form data. Read-only — no interaction. */
export default function BannerLivePreview({ banner }: BannerLivePreviewProps) {
  const layout = getLayout(banner.layout);
  const Layout = layout.Component;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
      <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Live Preview · {layout.name}</div>
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
  );
}
