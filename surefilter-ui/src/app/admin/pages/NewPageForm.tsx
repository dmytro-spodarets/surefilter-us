'use client';

import { useState } from 'react';

export default function NewPageForm() {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, title, description, ogImage }),
    });
    setLoading(false);
    if (!res.ok) {
      const t = await res.json().catch(() => ({} as any));
      setError(t?.error || 'Failed to create page');
      return;
    }
    const { page } = await res.json();
    window.location.href = `/admin/pages/${page.slug}`;
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg">New page</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create new page</h3>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <form onSubmit={onSubmit} className="grid gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Slug</label>
                <input placeholder="expo-aapex-2025" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">OG Image URL</label>
                <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


