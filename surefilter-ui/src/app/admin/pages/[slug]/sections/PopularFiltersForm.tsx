'use client';

import { useState } from 'react';

type Item = { name: string; category?: string; applications?: string; image?: string; href?: string };

export default function PopularFiltersForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Popular Filters');
  const [description, setDescription] = useState(initialData?.description || '');
  const [catalogHref, setCatalogHref] = useState(initialData?.catalogHref || '/catalog');
  const [catalogText, setCatalogText] = useState(initialData?.catalogText || 'Browse All Filters');
  const [columnsPerRow, setColumnsPerRow] = useState<number>(initialData?.columnsPerRow || 5);
  const [items, setItems] = useState<Item[]>(Array.isArray(initialData?.items) ? initialData.items : []);
  const [saving, setSaving] = useState(false);

  const updateItem = (idx: number, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { name: '', category: '', applications: '', image: '', href: '' }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'popular_filters', data: { title, description, catalogHref, catalogText, columnsPerRow, items } }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Catalog link text</label>
          <input value={catalogText} onChange={(e) => setCatalogText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Catalog href</label>
          <input value={catalogHref} onChange={(e) => setCatalogHref(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Columns per row</label>
          <input type="number" min={1} max={6} value={columnsPerRow} onChange={(e) => setColumnsPerRow(parseInt(e.target.value || '5', 10))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Items</h4>
          <button type="button" onClick={addItem} className="px-3 py-2 rounded-lg border border-gray-300">Add item</button>
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 border border-gray-200 rounded-lg p-3">
            <input placeholder="Name" value={it.name} onChange={(e) => updateItem(idx, { name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Category" value={it.category || ''} onChange={(e) => updateItem(idx, { category: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Applications" value={it.applications || ''} onChange={(e) => updateItem(idx, { applications: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Image URL" value={it.image || ''} onChange={(e) => updateItem(idx, { image: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex items-center gap-2">
              <input placeholder="Href" value={it.href || ''} onChange={(e) => updateItem(idx, { href: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={() => removeItem(idx)} className="px-3 py-2 rounded-lg border border-gray-300">×</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}


