'use client';

import { useState } from 'react';
import type { PageHeroInput } from '@/cms/schemas';

export default function PageHeroForm({ sectionId, initialData }: { sectionId: string; initialData: PageHeroInput }) {
  const [form, setForm] = useState<PageHeroInput>({
    title: initialData.title || '',
    description: initialData.description || '',
    image1: initialData.image1 || '/images/image.jpg',
    image1Alt: initialData.image1Alt || 'Filter manufacturing',
    image2: initialData.image2 || '/images/image-2.jpg',
    image2Alt: initialData.image2Alt || 'Quality control',
    image3: initialData.image3 || '/images/image-3.jpg',
    image3Alt: initialData.image3Alt || 'Industrial equipment',
    image4: initialData.image4 || '/images/image-4.jpg',
    image4Alt: initialData.image4Alt || 'Heavy duty machinery',
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
      body: JSON.stringify({ type: 'page_hero', data: form }),
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Page Hero</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {/* Grid Images */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Grid Images (2×2)</h3>
          <p className="text-xs text-gray-500 mb-4">These images will be displayed in a 2×2 grid on the right side. Images 2 and 4 will have offset effect.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image 1 (Top Left)
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image1} 
                onChange={(e) => setForm({ ...form, image1: e.target.value })}
                placeholder="/images/image.jpg or CDN URL"
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image1Alt} 
                onChange={(e) => setForm({ ...form, image1Alt: e.target.value })}
                placeholder="Alt text"
              />
            </div>

            {/* Image 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image 2 (Top Right) <span className="text-xs text-gray-500">- Offset</span>
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image2} 
                onChange={(e) => setForm({ ...form, image2: e.target.value })}
                placeholder="/images/image-2.jpg or CDN URL"
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image2Alt} 
                onChange={(e) => setForm({ ...form, image2Alt: e.target.value })}
                placeholder="Alt text"
              />
            </div>

            {/* Image 3 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image 3 (Bottom Left)
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image3} 
                onChange={(e) => setForm({ ...form, image3: e.target.value })}
                placeholder="/images/image-3.jpg or CDN URL"
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image3Alt} 
                onChange={(e) => setForm({ ...form, image3Alt: e.target.value })}
                placeholder="Alt text"
              />
            </div>

            {/* Image 4 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image 4 (Bottom Right) <span className="text-xs text-gray-500">- Offset</span>
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image4} 
                onChange={(e) => setForm({ ...form, image4: e.target.value })}
                placeholder="/images/image-4.jpg or CDN URL"
              />
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                value={form.image4Alt} 
                onChange={(e) => setForm({ ...form, image4Alt: e.target.value })}
                placeholder="Alt text"
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            💡 Use File Manager to upload and copy CDN URL, or use /images/* paths
          </p>
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


