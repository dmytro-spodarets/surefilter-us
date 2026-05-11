export type BannerType = 'LEAD_CAPTURE' | 'CTA';
export type BannerStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BannerCampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type BannerDismissMode = 'SESSION' | 'DAYS' | 'FOREVER';

export interface UtmRule {
  key: string;
  op: 'equals' | 'contains' | 'startsWith';
  value: string;
}

export interface RefererRule {
  op: 'equals' | 'contains' | 'startsWith';
  value: string;
}

/**
 * Banner data shape returned to public clients.
 * Strips sensitive fields (notifyEmail) and admin-only metadata.
 */
export interface PublicBanner {
  id: string;
  slug: string;
  type: BannerType;

  layout: string;
  /** Layout-specific configuration (free-form per layout, validated server-side). */
  layoutConfig?: unknown;
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;

  title: string;
  body?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;

  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaOpenInNewTab: boolean;

  emailPlaceholder?: string | null;
  submitLabel?: string | null;
  successTitle?: string | null;
  successMessage?: string | null;

  targetAllPages: boolean;
  targetSlugs: string[];
  excludeSlugs: string[];

  delayMs: number;
  utmRules?: UtmRule[] | null;
  refererRules?: RefererRule[] | null;

  dismissMode: BannerDismissMode;
  dismissTtlDays?: number | null;

  priority: number;

  campaignId?: string | null;
}
