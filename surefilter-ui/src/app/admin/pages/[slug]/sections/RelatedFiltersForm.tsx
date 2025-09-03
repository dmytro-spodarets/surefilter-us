'use client';

import { useState } from 'react';

export default function RelatedFiltersForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Related Filter Types');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<'HEAVY_DUTY' | 'AUTOMOTIVE' | ''>((initialData?.category as any) || '');
  const [saving, setSaving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'related_filters', data: { title, description, category: category || undefined } }),
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
      <div>
        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select value={category} onChange={(e) => setCategory((e.target.value as any) || '')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Auto-detect from page</option>
          <option value="HEAVY_DUTY">Heavy Duty</option>
          <option value="AUTOMOTIVE">Automotive</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">If empty, the component will infer the category from the page slug (starts with /heavy-duty or /automotive).</p>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}


