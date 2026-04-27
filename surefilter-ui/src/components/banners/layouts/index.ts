import type { BannerType } from '@/types/banners';
import { ClassicCenteredLayout, classicCenteredMeta } from './ClassicCentered';
import { SideImageLayout, sideImageMeta } from './SideImage';
import { MinimalTextLayout, minimalTextMeta } from './MinimalText';
import type { BannerLayoutMeta } from './types';

export const DEFAULT_LAYOUT_ID = 'classic_centered';

export const bannerLayouts: Record<string, BannerLayoutMeta> = {
  [classicCenteredMeta.id]: { ...classicCenteredMeta, Component: ClassicCenteredLayout },
  [sideImageMeta.id]: { ...sideImageMeta, Component: SideImageLayout },
  [minimalTextMeta.id]: { ...minimalTextMeta, Component: MinimalTextLayout },
};

export function getLayout(id: string | undefined | null): BannerLayoutMeta {
  if (id && bannerLayouts[id]) return bannerLayouts[id];
  return bannerLayouts[DEFAULT_LAYOUT_ID];
}

export function listLayouts(type?: BannerType): BannerLayoutMeta[] {
  const all = Object.values(bannerLayouts);
  return type ? all.filter((l) => l.supportedTypes.includes(type)) : all;
}

export type { BannerLayoutMeta, BannerLayoutProps, BannerLayoutState } from './types';
