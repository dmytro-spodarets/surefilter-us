'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const OPTIONS = [
  // Home
  { value: 'hero_full', label: 'Home: Hero Full' },
  { value: 'hero_carousel', label: 'Home: Hero Carousel (Slider)' },
  { value: 'hero_compact', label: 'Home: Hero Compact' },
  { value: 'featured_products', label: 'Home: Featured Products (Manual)' },
  { value: 'featured_products_catalog', label: 'Home: Featured Products (Catalog)' },
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
  { value: 'industry_showcase', label: 'Industry: Showcase (Overview + Metrics)' },
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

  // Forms
  { value: 'form_embed', label: 'Forms: Embed Universal Form' },

  // Warranty
  { value: 'limited_warranty_details', label: 'Warranty: Limited Details' },
  { value: 'magnusson_moss_act', label: 'Warranty: Magnusson-Moss Act' },
  { value: 'warranty_claim_process', label: 'Warranty: Claim Process' },
  { value: 'warranty_contact', label: 'Warranty: Contact' },
  { value: 'warranty_promise', label: 'Warranty: Promise' },
];

interface SharedSection {
  id: string;
  name: string;
  type: string;
  _count: { sections: number };
}

export default function AddSectionForm({ slug }: { slug: string }) {
  const [mode, setMode] = useState<'new' | 'shared'>('new');
  const [type, setType] = useState('page_hero');
  const [sharedSectionId, setSharedSectionId] = useState('');
  const [sharedSections, setSharedSections] = useState<SharedSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'shared') {
      loadSharedSections();
    }
  }, [mode]);

  const loadSharedSections = async () => {
    try {
      const res = await fetch('/api/admin/shared-sections');
      const data = await res.json();
      setSharedSections(data.sharedSections || []);
    } catch (error) {
      console.error('Error loading shared sections:', error);
    }
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'shared' && sharedSectionId) {
        // Add shared section reference
        const res = await fetch(`/api/admin/pages/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'shared', // Special type to indicate shared section
            sharedSectionId 
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error || 'Failed to add shared section');
          return;
        }
      } else {
        // Add new section
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
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'new'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          New Section
        </button>
        <button
          type="button"
          onClick={() => setMode('shared')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'shared'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Use Shared Section
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onAdd} className="flex items-center gap-3">
        {mode === 'new' ? (
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <select 
              value={sharedSectionId} 
              onChange={(e) => setSharedSectionId(e.target.value)} 
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select a shared section...</option>
              {sharedSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} ({section.type}) - Used on {section._count.sections} page(s)
                </option>
              ))}
            </select>
            <Link
              href="/admin/shared-sections/new"
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 whitespace-nowrap"
            >
              + Create New
            </Link>
          </div>
        )}
        <button 
          type="submit" 
          className="bg-sure-blue-600 text-white px-4 py-2 rounded-lg hover:bg-sure-blue-700 disabled:opacity-50" 
          disabled={loading || (mode === 'shared' && !sharedSectionId)}
        >
          {loading ? 'Adding…' : 'Add Section'}
        </button>
      </form>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}


