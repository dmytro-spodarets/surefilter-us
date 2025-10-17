'use client';

import { useState } from 'react';

const OPTIONS = [
  // Home
  { value: 'hero_full', label: 'Home: Hero Full' },
  { value: 'hero_compact', label: 'Home: Hero Compact' },
  { value: 'featured_products', label: 'Home: Featured Products' },
  { value: 'why_choose', label: 'Home: Why Choose' },
  { value: 'quick_search', label: 'Home: Quick Search' },
  { value: 'industries', label: 'Home: Industries' },
  { value: 'about_news', label: 'Home: About & News' },

  // Page Heroes
  { value: 'page_hero', label: 'Page: Hero' },
  { value: 'page_hero_reverse', label: 'Page: Hero Reverse' },
  { value: 'single_image_hero', label: 'Generic: FullScreen Hero' },

  // Search & Navigation
  { value: 'compact_search_hero', label: 'Search: Compact Hero' },
  { value: 'search_hero', label: 'Search: Hero' },
  { value: 'simple_search', label: 'Search: Simple' },
  { value: 'quick_search', label: 'Search: Quick' },

  // Industries & Filters
  { value: 'industries_list', label: 'Industries: List (dynamic)' },
  { value: 'listing_card_meta', label: 'Listing Card Meta (for list cards)' },
  { value: 'popular_filters', label: 'Industry: Popular Filters' },
  { value: 'related_filters', label: 'Industry: Related Filter Types' },
  { value: 'filter_types_grid', label: 'Heavy Duty: Filter Types Grid (Icons)' },
  { value: 'filter_types_image_grid', label: 'Heavy Duty: Filter Types Grid (Images)' },

  // About & Company
  { value: 'about_with_stats', label: 'About: With Stats' },
  { value: 'manufacturing_facilities', label: 'About: Manufacturing Facilities' },
  { value: 'our_company', label: 'About: Our Company (tabs)' },
  { value: 'stats_band', label: 'About: Stats Band' },
  { value: 'awards_carousel', label: 'About: Awards Carousel' },
  { value: 'quality_assurance', label: 'About: Quality Assurance' },

  // Content
  { value: 'content_with_images', label: 'Content: With Images' },
  { value: 'news_carousel', label: 'Content: News Carousel' },

  // Products
  { value: 'products', label: 'Products: List' },
  { value: 'product_gallery', label: 'Product: Gallery' },
  { value: 'product_specs', label: 'Product: Specifications' },

  // Contact
  { value: 'contact_hero', label: 'Contact: Hero' },
  { value: 'contact_options', label: 'Contact: Options (Call/Chat/Ask)' },
  { value: 'contact_form', label: 'Contact: Form' },
  { value: 'contact_info', label: 'Contact: Info' },
  { value: 'contact_details', label: 'Contact: Details' },
  { value: 'contact_form_info', label: 'Contact: Form + Info' },

  // Warranty
  { value: 'limited_warranty_details', label: 'Warranty: Limited Details' },
  { value: 'magnusson_moss_act', label: 'Warranty: Magnusson-Moss Act' },
  { value: 'warranty_claim_process', label: 'Warranty: Claim Process' },
  { value: 'warranty_contact', label: 'Warranty: Contact' },
  { value: 'warranty_promise', label: 'Warranty: Promise' },
];

export default function AddSectionForm({ slug }: { slug: string }) {
  const [type, setType] = useState('page_hero');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Failed to add section');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data?.id) {
        window.location.href = `/admin/sections/${data.id}`;
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onAdd} className="flex items-center gap-3 mb-4">
      <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg" disabled={loading}>{loading ? 'Adding…' : 'Add section'}</button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}


