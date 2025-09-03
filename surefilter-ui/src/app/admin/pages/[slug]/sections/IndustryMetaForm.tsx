'use client';

import { useState } from 'react';

export default function IndustryMetaForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [listTitle, setListTitle] = useState(initialData?.listTitle || '');
  const [listDescription, setListDescription] = useState(initialData?.listDescription || '');
  const [listImage, setListImage] = useState(initialData?.listImage || '');
  const [popularFilters, setPopularFilters] = useState<string[]>(Array.isArray(initialData?.popularFilters) ? initialData.popularFilters : []);
  const [newFilter, setNewFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const addFilter = () => {
    if (!newFilter.trim()) return;
    setPopularFilters((prev) => [...prev, newFilter.trim()]);
    setNewFilter('');
  };
  const removeFilter = (idx: number) => setPopularFilters((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'listing_card_meta', data: { listTitle, listDescription, listImage, popularFilters } }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">List title</label>
        <input value={listTitle} onChange={(e) => setListTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">List description</label>
        <textarea value={listDescription} onChange={(e) => setListDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">List image URL</label>
        <input value={listImage} onChange={(e) => setListImage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Popular filters</label>
        <div className="flex items-center gap-2 mb-2">
          <input value={newFilter} onChange={(e) => setNewFilter(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Air Filter A4567" />
          <button type="button" onClick={addFilter} className="px-3 py-2 rounded-lg border border-gray-300">Add</button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {popularFilters.map((f, i) => (
            <li key={`${f}-${i}`} className="text-xs bg-sure-blue-50 text-sure-blue-700 px-3 py-1 rounded-full border border-sure-blue-200 flex items-center gap-2">
              <span>{f}</span>
              <button type="button" onClick={() => removeFilter(i)} className="text-sure-blue-700 hover:text-sure-blue-900">×</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}


