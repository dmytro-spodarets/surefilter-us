'use client';

import { useState } from 'react';
import type { ContactHeroInput } from '@/cms/schemas';

export default function ContactHeroForm({ sectionId, initialData }: { sectionId: string; initialData: ContactHeroInput }) {
  const [form, setForm] = useState<ContactHeroInput>({ title: initialData.title || 'Contact Us', description: initialData.description || '', image: initialData.image || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'contact_hero', data: form }) });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Hero</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Image URL</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </section>
  );
}


