'use client';

import { useState } from 'react';
import { HeroFullSchema, type HeroFullInput } from '@/cms/schemas';

export default function HomeHeroForm({ sectionId, initialData }: { sectionId: string; initialData: HeroFullInput }) {
  const [form, setForm] = useState<HeroFullInput>(HeroFullSchema.parse(initialData));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof HeroFullInput, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'hero_full', data: form }),
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Home — Hero</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Badge</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.badge ?? ''} onChange={(e) => update('badge', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title prefix</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.titlePrefix ?? ''} onChange={(e) => update('titlePrefix', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title highlight</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.titleHighlight ?? ''} onChange={(e) => update('titleHighlight', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.subtitle ?? ''} onChange={(e) => update('subtitle', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Image</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.image ?? ''} onChange={(e) => update('image', e.target.value)} />
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


