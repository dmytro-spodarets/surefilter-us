export type SectionType =
  | 'hero_full'
  | 'hero_compact'
  | 'page_hero'
  | 'page_hero_reverse'
  | 'single_image_hero'
  | 'compact_search_hero'
  | 'simple_search'
  | 'search_hero'
  | 'why_choose'
  | 'featured_products'
  | 'products'
  | 'quick_search'
  | 'industries'
  | 'industries_list'
  | 'industry_meta'
  | 'filter_types_grid'
  | 'popular_filters'
  | 'about_with_stats'
  | 'about_news'
  | 'quality_assurance'
  | 'content_with_images'
  | 'related_filters'
  | 'news_carousel'
  | 'product_gallery'
  | 'product_specs'
  | 'limited_warranty_details'
  | 'magnusson_moss_act'
  | 'warranty_claim_process'
  | 'warranty_contact'
  | 'warranty_promise'
  | 'popular_filters'
  | 'contact_options'
  | 'manufacturing_facilities'
  | 'our_company'
  | 'stats_band'
  | 'awards_carousel';

export interface CmsSection<T = unknown> {
  id: string;
  type: SectionType;
  data: T;
  position: number;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  ogImage?: string | null;
  sections: CmsSection[];
}

// Minimal data shapes for selected sections
export interface HeroFullData {
  badge?: string;
  title?: string;
  subtitle?: string;
  image?: string;
}

