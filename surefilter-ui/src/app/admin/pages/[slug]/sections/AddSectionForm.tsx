'use client';

import { useState } from 'react';

const OPTIONS = [
  // Home
  { value: 'hero_full', label: 'Home: Hero Full' },
  { value: 'featured_products', label: 'Home: Featured Products' },
  { value: 'why_choose', label: 'Home: Why Choose' },
  { value: 'quick_search', label: 'Home: Quick Search' },
  { value: 'industries', label: 'Home: Industries' },
  { value: 'about_news', label: 'Home: About & News' },

  // About Us
  { value: 'page_hero', label: 'About: Page Hero' },
  { value: 'manufacturing_facilities', label: 'About: Manufacturing Facilities' },
  { value: 'our_company', label: 'About: Our Company (tabs)' },
  { value: 'stats_band', label: 'About: Stats Band' },
  { value: 'awards_carousel', label: 'About: Awards Carousel' },
  { value: 'quality_assurance', label: 'About: Quality Assurance' },

  // Contact Us
  { value: 'contact_hero', label: 'Contact: Hero' },
  { value: 'contact_options', label: 'Contact: Options (Call/Chat/Ask)' },
  { value: 'contact_form_info', label: 'Contact: Form + Info' },
];

export default function AddSectionForm({ slug }: { slug: string }) {
  const [type, setType] = useState('page_hero');
  const [loading, setLoading] = useState(false);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/admin/pages/${slug}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      location.reload();
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
    </form>
  );
}


