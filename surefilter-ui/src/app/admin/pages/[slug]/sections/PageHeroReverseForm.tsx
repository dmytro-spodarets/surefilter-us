'use client';

import { useState } from 'react';
import type { PageHeroReverseInput } from '@/cms/schemas';

export default function PageHeroReverseForm({ sectionId, initialData }: { sectionId: string; initialData: PageHeroReverseInput }) {
  const [form, setForm] = useState<PageHeroReverseInput>({
    title: initialData.title,
    description: initialData.description,
    image1: initialData.image1,
    image1Alt: initialData.image1Alt,
    image2: initialData.image2,
    image2Alt: initialData.image2Alt,
    image3: initialData.image3,
    image3Alt: initialData.image3Alt,
    image4: initialData.image4,
    image4Alt: initialData.image4Alt,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page_hero_reverse', data: form }),
    });
    setSaving(false);
    if (!res.ok) {
      const t = await res.text();
      setError(t || 'Save failed');
      return;
    }
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Page Hero Reverse</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-2">
          <h3 className="text-md font-medium text-gray-900 mb-3">Image Grid (2x2)</h3>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">Image 1 (Top Left with offset)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Image URL or S3 path"
                value={form.image1 ?? ''} 
                onChange={(e) => setForm({ ...form, image1: e.target.value })} 
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Alt text (for accessibility)"
                value={form.image1Alt ?? ''} 
                onChange={(e) => setForm({ ...form, image1Alt: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">Image 2 (Top Right)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Image URL or S3 path"
                value={form.image2 ?? ''} 
                onChange={(e) => setForm({ ...form, image2: e.target.value })} 
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Alt text (for accessibility)"
                value={form.image2Alt ?? ''} 
                onChange={(e) => setForm({ ...form, image2Alt: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">Image 3 (Bottom Left with offset)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Image URL or S3 path"
                value={form.image3 ?? ''} 
                onChange={(e) => setForm({ ...form, image3: e.target.value })} 
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Alt text (for accessibility)"
                value={form.image3Alt ?? ''} 
                onChange={(e) => setForm({ ...form, image3Alt: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">Image 4 (Bottom Right)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Image URL or S3 path"
                value={form.image4 ?? ''} 
                onChange={(e) => setForm({ ...form, image4: e.target.value })} 
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                placeholder="Alt text (for accessibility)"
                value={form.image4Alt ?? ''} 
                onChange={(e) => setForm({ ...form, image4Alt: e.target.value })} 
              />
            </div>
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
