'use client';

import { useState } from 'react';
import type { ContentWithImagesInput } from '@/cms/schemas';

export default function ContentWithImagesForm({ sectionId, initialData }: { sectionId: string; initialData: ContentWithImagesInput }) {
  const [form, setForm] = useState<ContentWithImagesInput>({
    title: initialData.title || '',
    subtitle: initialData.subtitle || '',
    content: Array.isArray(initialData.content) ? initialData.content : [],
    images: Array.isArray(initialData.images) ? initialData.images : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateParagraph = (idx: number, value: string) => {
    setForm((f) => {
      const content = [...f.content];
      content[idx] = value;
      return { ...f, content };
    });
  };
  const addParagraph = () => setForm((f) => ({ ...f, content: [...f.content, ''] }));
  const removeParagraph = (idx: number) => setForm((f) => ({ ...f, content: f.content.filter((_, i) => i !== idx) }));

  const updateImage = (idx: number, key: 'src' | 'alt' | 'position', value: string) => {
    setForm((f) => {
      const images = [...f.images];
      images[idx] = { ...images[idx], [key]: key === 'position' ? Number(value) : value } as any;
      return { ...f, images };
    });
  };
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, { src: '', alt: '', position: 1 }] }));
  const removeImage = (idx: number) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'content_with_images', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Content With Images</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Paragraphs</h3>
            <button type="button" onClick={addParagraph} className="text-sure-blue-600 hover:underline text-sm">Add paragraph</button>
          </div>
          {form.content.map((p, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-2">
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={p} onChange={(e) => updateParagraph(idx, e.target.value)} />
              <div className="text-right">
                <button type="button" onClick={() => removeParagraph(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Images</h3>
            <button type="button" onClick={addImage} className="text-sure-blue-600 hover:underline text-sm">Add image</button>
          </div>
          {form.images.map((img, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Src</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={img.src} onChange={(e) => updateImage(idx, 'src', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Alt</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={img.alt} onChange={(e) => updateImage(idx, 'alt', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Position (after paragraph #)</label>
                <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2" value={img.position} onChange={(e) => updateImage(idx, 'position', e.target.value)} />
              </div>
              <div className="md:col-span-3 text-right">
                <button type="button" onClick={() => removeImage(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
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


