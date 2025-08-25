'use client';

import { useState } from 'react';

export default function SeoForm({
  slug,
  initial,
}: {
  slug: string;
  initial: { title?: string | null; description?: string | null; ogImage?: string | null };
}) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [ogImage, setOgImage] = useState(initial.ogImage ?? '');
  const [newSlug, setNewSlug] = useState(slug);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch(`/api/admin/pages/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, ogImage, slug: newSlug }),
    });
    setSaving(false);
    if (!res.ok) {
      const t = await res.text();
      setError(t || 'Save failed');
      return;
    }
    setSaved(true);
    try {
      const { slug: returned } = await res.json();
      if (returned && returned !== slug) {
        window.location.href = `/admin/pages/${returned}`;
      }
    } catch {}
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {saved && <p className="text-sm text-green-700">Saved</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Slug</label>
          <input
            name="newSlug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">OG Image URL</label>
        <input
          name="ogImage"
          value={ogImage}
          onChange={(e) => setOgImage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <button
          type="submit"
          className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save SEO'}
        </button>
      </div>
    </form>
  );
}


