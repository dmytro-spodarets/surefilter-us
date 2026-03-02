'use client';

import { useState } from 'react';
import type { AwardsGalleryInput } from '@/cms/schemas';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function AwardsGalleryForm({ sectionId, initialData }: { sectionId: string; initialData: AwardsGalleryInput }) {
  const [form, setForm] = useState<AwardsGalleryInput>({
    title: initialData.title || '',
    subtitle: initialData.subtitle || '',
    items: Array.isArray(initialData.items) ? initialData.items : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const updateItem = (idx: number, key: keyof AwardsGalleryInput['items'][number], value: string) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...f, items };
    });
  };
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { title: '', image: '' }] }));
  const removeItem = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'awards_gallery', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Awards Gallery</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Items</h3>
            <button type="button" onClick={addItem} className="text-sure-blue-600 hover:underline text-sm">Add item</button>
          </div>
          {form.items.map((it, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 grid gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.title} onChange={(e) => updateItem(idx, 'title', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2" value={it.image || ''} onChange={(e) => updateItem(idx, 'image', e.target.value)} placeholder="S3 key or URL" />
                  <button type="button" onClick={() => setPickerIndex(idx)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Browse</button>
                </div>
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
      {pickerIndex !== null && (
        <MediaPickerModal
          isOpen={true}
          onSelect={(url) => {
            updateItem(pickerIndex, 'image', url);
            setPickerIndex(null);
          }}
          onClose={() => setPickerIndex(null)}
        />
      )}
    </section>
  );
}
