'use client';

import { useState } from 'react';
import type { WarrantyContactInput } from '@/cms/schemas';

export default function WarrantyContactForm({ sectionId, initialData }: { sectionId: string; initialData: WarrantyContactInput }) {
  const [form, setForm] = useState<WarrantyContactInput>({
    title: initialData.title,
    subtitle: initialData.subtitle,
    phone: initialData.phone,
    phoneHours: initialData.phoneHours,
    email: initialData.email,
    emailResponse: initialData.emailResponse,
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
      body: JSON.stringify({ type: 'warranty_contact', data: form }),
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Warranty Contact</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Phone Hours</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.phoneHours} onChange={(e) => setForm({ ...form, phoneHours: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email Address</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email Response Time</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.emailResponse} onChange={(e) => setForm({ ...form, emailResponse: e.target.value })} />
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
