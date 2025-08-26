'use client';

import { useState } from 'react';

export default function SimpleSearchForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Find Your Filter');
  const [description, setDescription] = useState(initialData?.description || 'Search by part number or equipment model');
  const [placeholder, setPlaceholder] = useState(initialData?.placeholder || 'Enter part number or equipment model...');
  const [buttonText, setButtonText] = useState(initialData?.buttonText || 'Search');
  const [saving, setSaving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'simple_search', data: { title, description, placeholder, buttonText } }),
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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Placeholder</label>
          <input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Button text</label>
          <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}


