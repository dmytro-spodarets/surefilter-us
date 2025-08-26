'use client';

import { useState } from 'react';

type Rel = { name: string; description?: string; href?: string; icon?: string };

export default function RelatedFiltersForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Related Filter Types');
  const [description, setDescription] = useState(initialData?.description || '');
  const [filters, setFilters] = useState<Rel[]>(Array.isArray(initialData?.filters) ? initialData.filters : []);
  const [saving, setSaving] = useState(false);

  const update = (idx: number, patch: Partial<Rel>) => setFilters((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const add = () => setFilters((prev) => [...prev, { name: '', description: '', href: '', icon: '' }]);
  const remove = (idx: number) => setFilters((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'related_filters', data: { title, description, filters } }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Filters</h4>
          <button type="button" onClick={add} className="px-3 py-2 rounded-lg border border-gray-300">Add</button>
        </div>
        {filters.map((it, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-gray-200 rounded-lg p-3">
            <input placeholder="Name" value={it.name} onChange={(e) => update(idx, { name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Description" value={it.description || ''} onChange={(e) => update(idx, { description: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Href" value={it.href || ''} onChange={(e) => update(idx, { href: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex items-center gap-2">
              <input placeholder="Icon (e.g. CloudIcon)" value={it.icon || ''} onChange={(e) => update(idx, { icon: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
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


