'use client';

import { useState } from 'react';
import type { WhyChooseInput } from '@/cms/schemas';

export default function WhyChooseForm({ sectionId, initialData }: { sectionId: string; initialData: WhyChooseInput }) {
  const [form, setForm] = useState<WhyChooseInput>({
    title: initialData.title || 'Why Choose Sure Filter®?',
    description: initialData.description || '',
    items: Array.isArray(initialData.items) ? initialData.items : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateItem = (idx: number, key: keyof WhyChooseInput['items'][number], value: string) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: value } as any;
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { icon: 'CheckCircleIcon', title: '', text: '' }] }));
  const removeItem = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'why_choose', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Why Choose</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Items</h3>
            <button type="button" onClick={addItem} className="text-sure-blue-600 hover:underline text-sm">Add item</button>
          </div>
          {form.items.map((it, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.title} onChange={(e) => updateItem(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Icon</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.icon || ''} onChange={(e) => updateItem(idx, 'icon', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Text</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.text || ''} onChange={(e) => updateItem(idx, 'text', e.target.value)} />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => removeItem(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
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


