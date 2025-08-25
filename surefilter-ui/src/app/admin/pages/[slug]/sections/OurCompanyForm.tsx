'use client';

import { useState } from 'react';
import type { OurCompanyInput } from '@/cms/schemas';

export default function OurCompanyForm({ sectionId, initialData }: { sectionId: string; initialData: OurCompanyInput }) {
  const [form, setForm] = useState<OurCompanyInput>({
    title: initialData.title || 'Our Company',
    subtitle: initialData.subtitle || '',
    tabs: Array.isArray(initialData.tabs) ? initialData.tabs : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateTab = (idx: number, key: keyof OurCompanyInput['tabs'][number], value: string) => {
    setForm((f) => {
      const tabs = [...f.tabs];
      tabs[idx] = { ...(tabs[idx] as any), [key]: value } as any;
      return { ...f, tabs };
    });
  };
  const addTab = () => setForm((f) => ({ ...f, tabs: [...f.tabs, { key: '', title: '', content: '' }] }));
  const removeTab = (idx: number) => setForm((f) => ({ ...f, tabs: f.tabs.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'our_company', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Our Company</h2>
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
            <h3 className="font-medium text-gray-900">Tabs</h3>
            <button type="button" onClick={addTab} className="text-sure-blue-600 hover:underline text-sm">Add tab</button>
          </div>
          {form.tabs.map((it, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Key</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.key} onChange={(e) => updateTab(idx, 'key', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.title} onChange={(e) => updateTab(idx, 'title', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Content</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} value={it.content} onChange={(e) => updateTab(idx, 'content', e.target.value)} />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => removeTab(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
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


