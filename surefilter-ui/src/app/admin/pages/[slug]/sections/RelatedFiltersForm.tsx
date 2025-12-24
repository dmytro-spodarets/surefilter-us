'use client';

import { useState, useEffect } from 'react';

export default function RelatedFiltersForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || 'Related Filter Types');
  const [description, setDescription] = useState(initialData?.description || '');
  const [filterTypeIds, setFilterTypeIds] = useState<string[]>(initialData?.filterTypeIds || []);
  const [allFilterTypes, setAllFilterTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/filter-types')
      .then(res => res.json())
      .then(data => {
        setAllFilterTypes(data.filterTypes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'related_filters', data: { title, description, filterTypeIds } }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Save error:', error);
        alert(`Failed to save: ${error.error || 'Unknown error'}\n${error.details ? JSON.stringify(error.details) : ''}`);
      } else {
        alert('Saved successfully!');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newIds = [...filterTypeIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setFilterTypeIds(newIds);
  };

  const moveDown = (index: number) => {
    if (index === filterTypeIds.length - 1) return;
    const newIds = [...filterTypeIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    setFilterTypeIds(newIds);
  };

  const removeFilter = (id: string) => {
    setFilterTypeIds(filterTypeIds.filter(fid => fid !== id));
  };

  const addFilter = (id: string) => {
    if (!filterTypeIds.includes(id)) {
      setFilterTypeIds([...filterTypeIds, id]);
    }
  };

  const selectedFilters = filterTypeIds.map(id => allFilterTypes.find(ft => ft.id === id)).filter(Boolean);
  const availableFilters = allFilterTypes.filter(ft => !filterTypeIds.includes(ft.id));

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Filter Types</label>
        {loading ? (
          <p className="text-sm text-gray-500">Loading filter types...</p>
        ) : selectedFilters.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No filter types selected. Add from the list below.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {selectedFilters.map((ft: any, index: number) => (
              <div key={ft.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{ft.name}</p>
                  <p className="text-xs text-gray-500">{ft.fullSlug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === selectedFilters.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFilter(ft.id)}
                    className="p-1 text-red-500 hover:text-red-700 ml-2"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Filter Types</label>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : availableFilters.length === 0 ? (
          <p className="text-sm text-gray-500 italic">All filter types have been added.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {availableFilters.map((ft: any) => (
              <div
                key={ft.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{ft.name}</p>
                  <p className="text-xs text-gray-500">{ft.fullSlug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addFilter(ft.id)}
                  className="text-sm text-sure-blue-600 hover:text-sure-blue-700 font-medium"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button type="submit" className="bg-sure-blue-600 text-white px-4 py-2 rounded-lg hover:bg-sure-blue-700 disabled:opacity-60" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}


