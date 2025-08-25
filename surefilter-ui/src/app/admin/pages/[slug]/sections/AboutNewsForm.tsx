'use client';

import { useState } from 'react';
import type { AboutNewsInput } from '@/cms/schemas';

export default function AboutNewsForm({ sectionId, initialData }: { sectionId: string; initialData: AboutNewsInput }) {
  const [form, setForm] = useState<AboutNewsInput>({
    aboutTitle: initialData.aboutTitle || 'Who We Are',
    aboutParagraphs: Array.isArray(initialData.aboutParagraphs) ? initialData.aboutParagraphs : [],
    stats: Array.isArray(initialData.stats) ? initialData.stats : [],
    aboutCtaLabel: initialData.aboutCtaLabel || 'Learn More About Us',
    aboutCtaHref: initialData.aboutCtaHref || '#',
    newsTitle: initialData.newsTitle || 'News & Updates',
    newsItems: Array.isArray(initialData.newsItems) ? initialData.newsItems : [],
    newsCtaLabel: initialData.newsCtaLabel || 'See All News',
    newsCtaHref: initialData.newsCtaHref || '#',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // About paragraphs helpers
  const addParagraph = () => setForm((f) => ({ ...f, aboutParagraphs: [...f.aboutParagraphs, ''] }));
  const updateParagraph = (idx: number, value: string) => setForm((f) => ({ ...f, aboutParagraphs: f.aboutParagraphs.map((p, i) => (i === idx ? value : p)) }));
  const removeParagraph = (idx: number) => setForm((f) => ({ ...f, aboutParagraphs: f.aboutParagraphs.filter((_, i) => i !== idx) }));

  // Stats helpers
  const addStat = () => setForm((f) => ({ ...f, stats: [...f.stats, { number: '', label: '' }] }));
  const updateStat = (idx: number, key: 'number' | 'label', value: string) => setForm((f) => ({ ...f, stats: f.stats.map((s, i) => (i === idx ? { ...s, [key]: value } : s)) }));
  const removeStat = (idx: number) => setForm((f) => ({ ...f, stats: f.stats.filter((_, i) => i !== idx) }));

  // News helpers
  const addNews = () => setForm((f) => ({ ...f, newsItems: [...f.newsItems, { title: '', date: '', category: '', href: '' }] }));
  const updateNews = (idx: number, key: 'title' | 'date' | 'category' | 'href', value: string) => setForm((f) => ({ ...f, newsItems: f.newsItems.map((n, i) => (i === idx ? { ...n, [key]: value } : n)) }));
  const removeNews = (idx: number) => setForm((f) => ({ ...f, newsItems: f.newsItems.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'about_news', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">About & News</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* About column */}
        <div className="grid gap-4">
          <h3 className="font-medium text-gray-900">About (left column)</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.aboutTitle || ''} onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-700">Paragraphs</label>
              <button type="button" onClick={addParagraph} className="text-sure-blue-600 hover:underline text-sm">Add paragraph</button>
            </div>
            {form.aboutParagraphs.map((p, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={idx === 0 ? 3 : 4} value={p} onChange={(e) => updateParagraph(idx, e.target.value)} />
                <button type="button" onClick={() => removeParagraph(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-700">Stats</label>
              <button type="button" onClick={addStat} className="text-sure-blue-600 hover:underline text-sm">Add stat</button>
            </div>
            {form.stats.map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Number</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={s.number} onChange={(e) => updateStat(idx, 'number', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Label</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={s.label} onChange={(e) => updateStat(idx, 'label', e.target.value)} />
                </div>
                <div className="text-right md:col-span-2">
                  <button type="button" onClick={() => removeStat(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">About CTA Label</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.aboutCtaLabel || ''} onChange={(e) => setForm({ ...form, aboutCtaLabel: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">About CTA Href</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.aboutCtaHref || ''} onChange={(e) => setForm({ ...form, aboutCtaHref: e.target.value })} />
            </div>
          </div>
        </div>

        {/* News column */}
        <div className="grid gap-4">
          <h3 className="font-medium text-gray-900">News (right column)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.newsTitle || ''} onChange={(e) => setForm({ ...form, newsTitle: e.target.value })} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-700">News items</label>
              <button type="button" onClick={addNews} className="text-sure-blue-600 hover:underline text-sm">Add news</button>
            </div>
            {form.newsItems.map((n, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={n.title} onChange={(e) => updateNews(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={n.date} onChange={(e) => updateNews(idx, 'date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Category</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={n.category} onChange={(e) => updateNews(idx, 'category', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Href (optional)</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={n.href || ''} onChange={(e) => updateNews(idx, 'href', e.target.value)} />
                </div>
                <div className="text-right md:col-span-2">
                  <button type="button" onClick={() => removeNews(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">News CTA Label</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.newsCtaLabel || ''} onChange={(e) => setForm({ ...form, newsCtaLabel: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">News CTA Href</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.newsCtaHref || ''} onChange={(e) => setForm({ ...form, newsCtaHref: e.target.value })} />
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


