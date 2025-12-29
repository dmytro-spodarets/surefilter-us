'use client';

import { useState } from 'react';
import type { SidebarWidgetInput, SidebarWidgetBlock } from '@/cms/schemas';

export default function SidebarWidgetForm({ sectionId, initialData }: { sectionId: string; initialData: SidebarWidgetInput }) {
  const [form, setForm] = useState<SidebarWidgetInput>({
    blocks: initialData.blocks || [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    
    const res = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'sidebar_widget', data: form }),
    });
    
    setSaving(false);
    if (!res.ok) {
      const t = await res.text();
      setError(t || 'Save failed');
      return;
    }
    setSaved(true);
  };

  // Add new block
  const addBlock = (type: 'benefits' | 'stats' | 'badge' | 'custom_html') => {
    const newBlock: SidebarWidgetBlock = {
      id: `block-${Date.now()}`,
      widgetType: type,
      title: '',
      items: type === 'benefits' || type === 'stats' ? [] : undefined,
    };
    setForm({ ...form, blocks: [...(form.blocks || []), newBlock] });
  };

  // Remove block
  const removeBlock = (index: number) => {
    const blocks = [...(form.blocks || [])];
    blocks.splice(index, 1);
    setForm({ ...form, blocks });
  };

  // Move block up/down
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...(form.blocks || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setForm({ ...form, blocks });
  };

  // Update block field
  const updateBlock = (index: number, field: keyof SidebarWidgetBlock, value: any) => {
    const blocks = [...(form.blocks || [])];
    blocks[index] = { ...blocks[index], [field]: value };
    setForm({ ...form, blocks });
  };

  // Add item to block
  const addItem = (blockIndex: number) => {
    const blocks = [...(form.blocks || [])];
    const items = blocks[blockIndex].items || [];
    blocks[blockIndex] = { ...blocks[blockIndex], items: [...items, { label: '', value: '' }] };
    setForm({ ...form, blocks });
  };

  // Remove item from block
  const removeItem = (blockIndex: number, itemIndex: number) => {
    const blocks = [...(form.blocks || [])];
    const items = [...(blocks[blockIndex].items || [])];
    items.splice(itemIndex, 1);
    blocks[blockIndex] = { ...blocks[blockIndex], items };
    setForm({ ...form, blocks });
  };

  // Update item
  const updateItem = (blockIndex: number, itemIndex: number, field: 'label' | 'value', value: string) => {
    const blocks = [...(form.blocks || [])];
    const items = [...(blocks[blockIndex].items || [])];
    items[itemIndex] = { ...items[itemIndex], [field]: value };
    blocks[blockIndex] = { ...blocks[blockIndex], items };
    setForm({ ...form, blocks });
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Sidebar Widget (Multiple Blocks)</h2>
      <p className="text-sm text-gray-600 mb-4">Add multiple blocks to create a complete sidebar. Blocks will be displayed in order.</p>
      {saved && <p className="text-sm text-green-700 mb-3">✓ Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Add Block Buttons */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Block:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button type="button" onClick={() => addBlock('benefits')} className="bg-blue-500 text-white rounded px-3 py-2 text-sm hover:bg-blue-600">
              + Benefits
            </button>
            <button type="button" onClick={() => addBlock('stats')} className="bg-green-500 text-white rounded px-3 py-2 text-sm hover:bg-green-600">
              + Stats
            </button>
            <button type="button" onClick={() => addBlock('badge')} className="bg-purple-500 text-white rounded px-3 py-2 text-sm hover:bg-purple-600">
              + Badge
            </button>
            <button type="button" onClick={() => addBlock('custom_html')} className="bg-orange-500 text-white rounded px-3 py-2 text-sm hover:bg-orange-600">
              + HTML
            </button>
          </div>
        </div>

        {/* Blocks List */}
        {(form.blocks || []).map((block, blockIndex) => (
          <div key={block.id || blockIndex} className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">
                Block {blockIndex + 1}: {block.widgetType.charAt(0).toUpperCase() + block.widgetType.slice(1)}
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => moveBlock(blockIndex, 'up')} disabled={blockIndex === 0} className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => moveBlock(blockIndex, 'down')} disabled={blockIndex === (form.blocks?.length || 0) - 1} className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30">
                  ↓
                </button>
                <button type="button" onClick={() => removeBlock(blockIndex)} className="text-sm text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>

            {/* Benefits Block */}
            {block.widgetType === 'benefits' && (
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input 
                    className="w-full border border-gray-300 rounded px-3 py-2" 
                    value={block.title || ''} 
                    onChange={(e) => updateBlock(blockIndex, 'title', e.target.value)}
                    placeholder="Key Benefits"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-gray-700">Benefits List</label>
                    <button type="button" onClick={() => addItem(blockIndex)} className="text-sm text-blue-600 hover:underline">
                      + Add Benefit
                    </button>
                  </div>
                  {(block.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2 mb-2">
                      <input 
                        className="flex-1 border border-gray-300 rounded px-3 py-2" 
                        value={item.label || ''} 
                        onChange={(e) => updateItem(blockIndex, itemIndex, 'label', e.target.value)}
                        placeholder="Benefit text"
                      />
                      <button type="button" onClick={() => removeItem(blockIndex, itemIndex)} className="text-red-600 hover:text-red-700 px-2">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Block */}
            {block.widgetType === 'stats' && (
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input 
                    className="w-full border border-gray-300 rounded px-3 py-2" 
                    value={block.title || ''} 
                    onChange={(e) => updateBlock(blockIndex, 'title', e.target.value)}
                    placeholder="Quality Assurance"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-gray-700">Stats List</label>
                    <button type="button" onClick={() => addItem(blockIndex)} className="text-sm text-blue-600 hover:underline">
                      + Add Stat
                    </button>
                  </div>
                  {(block.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} className="grid grid-cols-2 gap-2 mb-2">
                      <input 
                        className="border border-gray-300 rounded px-3 py-2" 
                        value={item.value || ''} 
                        onChange={(e) => updateItem(blockIndex, itemIndex, 'value', e.target.value)}
                        placeholder="40+"
                      />
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 border border-gray-300 rounded px-3 py-2" 
                          value={item.label || ''} 
                          onChange={(e) => updateItem(blockIndex, itemIndex, 'label', e.target.value)}
                          placeholder="Years Experience"
                        />
                        <button type="button" onClick={() => removeItem(blockIndex, itemIndex)} className="text-red-600 hover:text-red-700 px-2">
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badge Block */}
            {block.widgetType === 'badge' && (
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Brand Name</label>
                  <input 
                    className="w-full border border-gray-300 rounded px-3 py-2" 
                    value={block.brandName || ''} 
                    onChange={(e) => updateBlock(blockIndex, 'brandName', e.target.value)}
                    placeholder="SURE®"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tagline</label>
                  <input 
                    className="w-full border border-gray-300 rounded px-3 py-2" 
                    value={block.tagline || ''} 
                    onChange={(e) => updateBlock(blockIndex, 'tagline', e.target.value)}
                    placeholder="Trusted Worldwide"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Certification</label>
                  <input 
                    className="w-full border border-gray-300 rounded px-3 py-2" 
                    value={block.certification || ''} 
                    onChange={(e) => updateBlock(blockIndex, 'certification', e.target.value)}
                    placeholder="ISO 9001:2015 Certified"
                  />
                </div>
              </div>
            )}

            {/* Custom HTML Block */}
            {block.widgetType === 'custom_html' && (
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">HTML Content</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm" 
                    rows={8}
                    value={block.htmlContent || ''} 
                    onChange={(e) => updateBlock(blockIndex, 'htmlContent', e.target.value)}
                    placeholder='<div class="ad-banner"><a href="/promo"><img src="/ad.jpg" alt="Promo" /></a></div>'
                  />
                </div>
                {block.htmlContent && (
                  <div className="border border-gray-200 rounded p-3 bg-gray-50">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <div dangerouslySetInnerHTML={{ __html: block.htmlContent }} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {(form.blocks || []).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No blocks added yet. Click a button above to add your first block.
          </div>
        )}

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-4">
          <button 
            type="submit" 
            className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600 disabled:opacity-50" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Sidebar Widget'}
          </button>
        </div>
      </form>
    </section>
  );
}
