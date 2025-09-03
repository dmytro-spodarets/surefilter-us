'use client';

import { useState } from 'react';

type Item = { name: string; icon?: string; href?: string };

export default function FilterTypesGridForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Filter Types');
  const [description, setDescription] = useState(initialData?.description || 'Choose the right filter type');
  const [items, setItems] = useState<Item[]>(Array.isArray(initialData?.items) ? initialData.items : []);
  const [saving, setSaving] = useState(false);

  const update = (idx: number, patch: Partial<Item>) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const add = () => setItems((prev) => [...prev, { name: '', icon: '', href: '' }]);
  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'filter_types_grid', data: { title, description, items } }),
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
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Items</h4>
          <button type="button" onClick={add} className="px-3 py-2 rounded-lg border border-gray-300">Add</button>
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-3">
            <input placeholder="Name" value={it.name} onChange={(e) => update(idx, { name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Icon (e.g. CogIcon)" value={it.icon || ''} onChange={(e) => update(idx, { icon: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex items-center gap-2">
              <input placeholder="Href" value={it.href || ''} onChange={(e) => update(idx, { href: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={() => remove(idx)} className="px-3 py-2 rounded-lg border border-gray-300">×</button>
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


