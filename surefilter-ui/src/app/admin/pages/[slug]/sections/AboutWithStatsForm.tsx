'use client';

import { useState } from 'react';
import type { AboutWithStatsInput } from '@/cms/schemas';

export default function AboutWithStatsForm({ sectionId, initialData }: { sectionId: string; initialData: AboutWithStatsInput }) {
  const [form, setForm] = useState<AboutWithStatsInput>({
    title: initialData.title || '',
    description: initialData.description || '',
    features: Array.isArray(initialData.features) ? initialData.features : [],
    stats: Array.isArray(initialData.stats) ? initialData.stats : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateFeature = (idx: number, key: keyof AboutWithStatsInput['features'][number], value: string) => {
    setForm((f) => {
      const features = [...f.features];
      features[idx] = { ...features[idx], [key]: value } as any;
      return { ...f, features };
    });
  };

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, { icon: 'CheckIcon', text: '' }] }));
  const removeFeature = (idx: number) => setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));

  const updateStat = (idx: number, key: keyof AboutWithStatsInput['stats'][number], value: string) => {
    setForm((f) => {
      const stats = [...f.stats];
      stats[idx] = { ...stats[idx], [key]: value } as any;
      return { ...f, stats };
    });
  };
  const addStat = () => setForm((f) => ({ ...f, stats: [...f.stats, { icon: 'StarIcon', title: '', subtitle: '' }] }));
  const removeStat = (idx: number) => setForm((f) => ({ ...f, stats: f.stats.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'about_with_stats', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">About With Stats</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Features</h3>
            <button type="button" onClick={addFeature} className="text-sure-blue-600 hover:underline text-sm">Add feature</button>
          </div>
          {form.features.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-gray-200 rounded-lg p-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Icon</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.icon} onChange={(e) => updateFeature(idx, 'icon', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Text</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.text} onChange={(e) => updateFeature(idx, 'text', e.target.value)} />
              </div>
              <div className="md:col-span-2 text-right">
                <button type="button" onClick={() => removeFeature(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Stats</h3>
            <button type="button" onClick={addStat} className="text-sure-blue-600 hover:underline text-sm">Add stat</button>
          </div>
          {form.stats.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Icon</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.icon} onChange={(e) => updateStat(idx, 'icon', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.title} onChange={(e) => updateStat(idx, 'title', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.subtitle} onChange={(e) => updateStat(idx, 'subtitle', e.target.value)} />
              </div>
              <div className="md:col-span-3 text-right">
                <button type="button" onClick={() => removeStat(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
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


