'use client';

import { useState } from 'react';

type Item = { name: string; image?: string; href?: string };

export default function FilterTypesImageGridForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Filter Types');
  const [description, setDescription] = useState(initialData?.description || 'Choose the right filter type for your equipment');
  const [items, setItems] = useState<Item[]>(Array.isArray(initialData?.items) ? initialData.items : []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const update = (idx: number, patch: Partial<Item>) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const add = () => setItems((prev) => [...prev, { name: '', image: '', href: '' }]);
  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'filter_types_image_grid', data: { title, description, items } }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save' });
        return;
      }
      
      setMessage({ type: 'success', text: 'Saved successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const openMediaPicker = (idx: number) => {
    // TODO: Integrate with media manager when available
    const url = prompt('Enter image URL or path (e.g., images/filters/oil-filter.png):');
    if (url) {
      update(idx, { image: url });
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <input 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" 
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Filter Type Items</h4>
          <button 
            type="button" 
            onClick={add} 
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            + Add Item
          </button>
        </div>
        
        {items.map((it, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input 
                  placeholder="e.g., Oil Filters" 
                  value={it.name} 
                  onChange={(e) => update(idx, { name: e.target.value })} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Link (href)</label>
                <input 
                  placeholder="e.g., /filters/oil" 
                  value={it.href || ''} 
                  onChange={(e) => update(idx, { href: e.target.value })} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Image</label>
              <div className="flex gap-2">
                <input 
                  placeholder="images/filters/oil-filter.png" 
                  value={it.image || ''} 
                  onChange={(e) => update(idx, { image: e.target.value })} 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" 
                />
                <button 
                  type="button" 
                  onClick={() => openMediaPicker(idx)} 
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  📁 Browse
                </button>
                <button 
                  type="button" 
                  onClick={() => remove(idx)} 
                  className="px-4 py-2 rounded-lg border border-red-300 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  🗑️ Remove
                </button>
              </div>
              {it.image && (
                <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg">
                  <img 
                    src={it.image.startsWith('http') ? it.image : `${process.env.NEXT_PUBLIC_CDN_URL || ''}/${it.image}`} 
                    alt={it.name} 
                    className="h-24 w-24 object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No items yet. Click "Add Item" to get started.
          </div>
        )}
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button 
          type="submit" 
          className="bg-sure-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sure-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" 
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

