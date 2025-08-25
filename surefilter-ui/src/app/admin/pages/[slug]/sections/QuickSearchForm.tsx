'use client';

import { useState } from 'react';
import type { QuickSearchInput } from '@/cms/schemas';

export default function QuickSearchForm({ sectionId, initialData }: { sectionId: string; initialData: QuickSearchInput }) {
  const [form, setForm] = useState<QuickSearchInput>({
    title: initialData.title || 'Find Your Filter Fast',
    description: initialData.description || 'Enter OEM number or competitor reference to find the right filter',
    placeholder: initialData.placeholder || 'Enter OEM number or competitor reference...',
    ctaLabel: initialData.ctaLabel || 'Ask our team',
    ctaHref: initialData.ctaHref || '#',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quick_search', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Search</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Placeholder</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.placeholder || ''} onChange={(e) => setForm({ ...form, placeholder: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">CTA Label</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.ctaLabel || ''} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">CTA Href</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.ctaHref || ''} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
          </div>
        </div>
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}


