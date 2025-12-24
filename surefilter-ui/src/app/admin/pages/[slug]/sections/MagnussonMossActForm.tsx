'use client';

import { useState } from 'react';
import type { MagnussonMossActInput } from '@/cms/schemas';

export default function MagnussonMossActForm({ sectionId, initialData }: { sectionId: string; initialData: MagnussonMossActInput }) {
  const [form, setForm] = useState<MagnussonMossActInput>({
    badge: initialData.badge,
    title: initialData.title,
    subtitle: initialData.subtitle,
    image: initialData.image,
    mainText: initialData.mainText,
    lawQuote: initialData.lawQuote,
    lawReference: initialData.lawReference,
    bottomText: initialData.bottomText,
    ctaTitle: initialData.ctaTitle,
    ctaText: initialData.ctaText,
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
      body: JSON.stringify({ type: 'magnusson_moss_act', data: form }),
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Magnusson-Moss Act</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Badge Text</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Image URL</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Main Text</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.mainText} onChange={(e) => setForm({ ...form, mainText: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Law Quote</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.lawQuote} onChange={(e) => setForm({ ...form, lawQuote: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Law Reference</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.lawReference} onChange={(e) => setForm({ ...form, lawReference: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Bottom Text (HTML allowed)</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.bottomText} onChange={(e) => setForm({ ...form, bottomText: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">CTA Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.ctaTitle} onChange={(e) => setForm({ ...form, ctaTitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">CTA Text</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
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
