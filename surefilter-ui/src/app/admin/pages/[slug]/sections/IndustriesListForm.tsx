'use client';

import { useState } from 'react';

export default function IndustriesListForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Our Industries');
  const [description, setDescription] = useState(initialData?.description || 'Specialized filtration solutions tailored to the unique challenges of each industry');
  const [saving, setSaving] = useState(false);
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'industries_list', data: { title, description } }),
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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}


