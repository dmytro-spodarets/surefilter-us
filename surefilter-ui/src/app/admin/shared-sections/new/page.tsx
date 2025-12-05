'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const SECTION_TYPES = [
  // Home
  { value: 'hero_full', label: 'Home: Hero Full' },
  { value: 'hero_carousel', label: 'Home: Hero Carousel (Slider)' },
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

export default function NewSharedSectionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type) {
      alert('Name and type are required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/shared-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          description: description || null,
          data: {}, // Empty data initially, will be filled in edit page
        }),
      });

      if (response.ok) {
        const { sharedSection } = await response.json();
        router.push(`/admin/shared-sections/${sharedSection.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create shared section');
      }
    } catch (error) {
      console.error('Error creating shared section:', error);
      alert('Failed to create shared section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/shared-sections"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Shared Sections
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Shared Section</h1>
          <p className="text-gray-600 mt-2">
            Create a reusable section that can be used across multiple pages
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g., Contact CTA, Newsletter Signup"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              A descriptive name to identify this shared section
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="">Select a type...</option>
              {SECTION_TYPES.map((sectionType) => (
                <option key={sectionType.value} value={sectionType.value}>
                  {sectionType.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Choose the type of section you want to create
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={3}
              placeholder="Add a description to help identify when to use this section"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After creating the shared section, you'll be able to configure its content on the next page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link
              href="/admin/shared-sections"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !name || !type}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create & Configure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
