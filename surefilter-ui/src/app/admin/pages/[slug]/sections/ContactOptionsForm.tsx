'use client';

import { useState } from 'react';
import type { ContactOptionsInput } from '@/cms/schemas';

export default function ContactOptionsForm({ sectionId, initialData }: { sectionId: string; initialData: ContactOptionsInput }) {
  const [items, setItems] = useState<Array<{ icon?: string; title: string; description?: string; href?: string; cta?: string }>>(
    Array.isArray(initialData.items) && initialData.items.length > 0
      ? initialData.items
      : [
          { icon: 'PhoneIcon', title: 'Call Us', description: '+1 (555) 123-4567', href: 'tel:+15551234567', cta: 'Call Now' },
          { icon: 'ChatBubbleLeftRightIcon', title: 'Chat Live', description: "We're available Sun 7:00pm EST – Friday 7:00pm EST", href: '#', cta: 'Chat Now' },
          { icon: 'EnvelopeIcon', title: 'Ask a Question', description: "Fill out our form and we'll get back to you in 24 hours.", href: '#contact-form', cta: 'Get Started' },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateItem = (idx: number, key: keyof (typeof items)[number], value: string) => {
    setItems((arr) => {
      const next = [...arr];
      next[idx] = { ...(next[idx] as any), [key]: value } as any;
      return next;
    });
  };
  const addItem = () => setItems((arr) => [...arr, { icon: 'PhoneIcon', title: '', description: '', href: '#', cta: '' }]);
  const removeItem = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact_options', data: { items } }),
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Options (Cards)</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Items</h3>
          <button type="button" onClick={addItem} className="text-sure-blue-600 hover:underline text-sm">Add item</button>
        </div>
        {items.map((it, idx) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.description || ''} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Href</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.href || ''} onChange={(e) => updateItem(idx, 'href', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">CTA</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={it.cta || ''} onChange={(e) => updateItem(idx, 'cta', e.target.value)} />
              </div>
              <div className="text-right md:self-end">
                <button type="button" onClick={() => removeItem(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          </div>
        ))}
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </section>
  );
}


