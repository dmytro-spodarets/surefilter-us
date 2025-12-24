'use client';

import { useState } from 'react';
import type { LimitedWarrantyDetailsInput } from '@/cms/schemas';

export default function LimitedWarrantyDetailsForm({ sectionId, initialData }: { sectionId: string; initialData: LimitedWarrantyDetailsInput }) {
  const [form, setForm] = useState<LimitedWarrantyDetailsInput>({
    title: initialData.title,
    subtitle: initialData.subtitle,
    image: initialData.image,
    introText: initialData.introText,
    promiseTitle: initialData.promiseTitle,
    promiseText: initialData.promiseText,
    warrantyTitle: initialData.warrantyTitle,
    warrantyText1: initialData.warrantyText1,
    warrantyText2: initialData.warrantyText2,
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
      body: JSON.stringify({ type: 'limited_warranty_details', data: form }),
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Limited Warranty Details</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
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
          <label className="block text-sm text-gray-700 mb-1">Intro Text</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.introText} onChange={(e) => setForm({ ...form, introText: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Promise Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.promiseTitle} onChange={(e) => setForm({ ...form, promiseTitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Promise Text</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.promiseText} onChange={(e) => setForm({ ...form, promiseText: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Warranty Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.warrantyTitle} onChange={(e) => setForm({ ...form, warrantyTitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Warranty Text 1</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.warrantyText1} onChange={(e) => setForm({ ...form, warrantyText1: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Warranty Text 2</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.warrantyText2} onChange={(e) => setForm({ ...form, warrantyText2: e.target.value })} />
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
