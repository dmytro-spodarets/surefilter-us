import type React from 'react';
import type { PublicBanner, BannerType } from '@/types/banners';

export type BannerLayoutState = 'idle' | 'submitting' | 'success' | 'error';

export interface BannerLayoutProps {
  banner: PublicBanner;
  /** Called for CTA banners on button click. Should track click then navigate. */
  onCtaClick: () => void;
  /** Called for LEAD_CAPTURE banners on form submit. Resolves on success. */
  onSubmit: (email: string) => Promise<void>;
  /** Close button — fires dismiss + storage write. */
  onDismiss: () => void;
  state: BannerLayoutState;
  errorMessage?: string;
}

export interface BannerLayoutMeta {
  id: string;
  name: string;
  description: string;
  /** Path to a static SVG preview shown in the admin gallery. */
  thumbnail: string;
  supportedTypes: BannerType[];
  Component: React.FC<BannerLayoutProps>;
}
