'use client';

import { useState } from 'react';
import type { LimitedWarrantyDetailsInput } from '@/cms/schemas';

export default function LimitedWarrantyDetailsForm({ sectionId, initialData }: { sectionId: string; initialData: LimitedWarrantyDetailsInput }) {
  const [form, setForm] = useState<LimitedWarrantyDetailsInput>({
    warrantyTitle: initialData.warrantyTitle,
    warrantyText1: initialData.warrantyText1,
    warrantyText2: initialData.warrantyText2,
    buttonsTitle: initialData.buttonsTitle,
    buttonsDescription: initialData.buttonsDescription,
    primaryButtonText: initialData.primaryButtonText,
    primaryButtonUrl: initialData.primaryButtonUrl,
    secondaryButtonText: initialData.secondaryButtonText,
    secondaryButtonUrl: initialData.secondaryButtonUrl,
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
      body: JSON.stringify({ type: 'limited_warranty_details', data: form }),
    });
    setSaving(false);
    if (!res.ok) {
      const t = await res.text();
      setError(t || 'Save failed');
      return;
    }
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Limited Warranty Details</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Warranty Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.warrantyTitle || ''} onChange={(e) => setForm({ ...form, warrantyTitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Warranty Text 1</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.warrantyText1 || ''} onChange={(e) => setForm({ ...form, warrantyText1: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Warranty Text 2</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.warrantyText2 || ''} onChange={(e) => setForm({ ...form, warrantyText2: e.target.value })} />
        </div>
        <h3 className="text-md font-medium text-gray-900 mt-4">Pre-Buttons Section</h3>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Buttons Title (h3)</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.buttonsTitle || ''} onChange={(e) => setForm({ ...form, buttonsTitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Buttons Description</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.buttonsDescription || ''} onChange={(e) => setForm({ ...form, buttonsDescription: e.target.value })} />
        </div>
        <h3 className="text-md font-medium text-gray-900 mt-4">Buttons</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Primary Button Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Download Warranty Certificate" value={form.primaryButtonText || ''} onChange={(e) => setForm({ ...form, primaryButtonText: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Primary Button URL</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://..." value={form.primaryButtonUrl || ''} onChange={(e) => setForm({ ...form, primaryButtonUrl: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Secondary Button Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Download Claim Form" value={form.secondaryButtonText || ''} onChange={(e) => setForm({ ...form, secondaryButtonText: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Secondary Button URL</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://..." value={form.secondaryButtonUrl || ''} onChange={(e) => setForm({ ...form, secondaryButtonUrl: e.target.value })} />
          </div>
        </div>
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
