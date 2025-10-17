'use client';

import { useState } from 'react';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

type Item = { name: string; image?: string; href?: string };

export default function FilterTypesImageGridForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Filter Types');
  const [description, setDescription] = useState(initialData?.description || 'Choose the right filter type for your equipment');
  const [columns, setColumns] = useState<number>(initialData?.columns || 4);
  const [variant, setVariant] = useState<'card' | 'simple'>(initialData?.variant || 'card');
  const [items, setItems] = useState<Item[]>(Array.isArray(initialData?.items) ? initialData.items : []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);

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
        body: JSON.stringify({ type: 'filter_types_image_grid', data: { title, description, columns, variant, items } }),
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
    setCurrentEditingIndex(idx);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (currentEditingIndex !== null) {
      update(currentEditingIndex, { image: url });
    }
  };

  return (
    <>
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Style variant</label>
            <select 
              value={variant} 
              onChange={(e) => setVariant(e.target.value as 'card' | 'simple')} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="card">Card (with border & background)</option>
              <option value="simple">Simple (clean, no borders)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Columns per row</label>
            <select 
              value={columns} 
              onChange={(e) => setColumns(parseInt(e.target.value))} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
              <option value={5}>5 columns</option>
              <option value={6}>6 columns</option>
              <option value={7}>7 columns</option>
              <option value={8}>8 columns</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Items</h4>
            <button 
              type="button" 
              onClick={add} 
              className="px-3 py-2 rounded-lg border border-gray-300"
            >
              Add item
            </button>
          </div>
          
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-gray-200 rounded-lg p-3">
              <input 
                placeholder="Name" 
                value={it.name} 
                onChange={(e) => update(idx, { name: e.target.value })} 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" 
              />
              <input 
                placeholder="Href" 
                value={it.href || ''} 
                onChange={(e) => update(idx, { href: e.target.value })} 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" 
              />
              <div className="flex gap-2">
                <input 
                  placeholder="Image URL" 
                  value={it.image || ''} 
                  onChange={(e) => update(idx, { image: e.target.value })} 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => openMediaPicker(idx)} 
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  title="Browse files"
                >
                  📁
                </button>
              </div>
              <button 
                type="button" 
                onClick={() => remove(idx)} 
                className="px-3 py-2 rounded-lg border border-gray-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-60" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
}

