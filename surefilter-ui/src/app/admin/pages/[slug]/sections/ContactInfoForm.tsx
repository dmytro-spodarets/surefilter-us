'use client';

import { useState } from 'react';
import type { ContactInfoInput } from '@/cms/schemas';

export default function ContactInfoForm({ sectionId, initialData }: { sectionId: string; initialData: ContactInfoInput }) {
  const [form, setForm] = useState<ContactInfoInput>({
    title: initialData.title || 'Get in Touch',
    general: initialData.general || { email: '', phone: '', fax: '' },
    support: initialData.support || { email: '', phone: '', hours: '' },
    address: initialData.address || { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (group: 'general' | 'support' | 'address', key: string, value: string) => {
    setForm((f) => ({ ...f, [group]: { ...(f as any)[group], [key]: value } as any }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'contact_info', data: form }) });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Info</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-6">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">General</h3>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Email" value={form.general?.email || ''} onChange={(e) => update('general', 'email', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Phone" value={form.general?.phone || ''} onChange={(e) => update('general', 'phone', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Fax" value={form.general?.fax || ''} onChange={(e) => update('general', 'fax', e.target.value)} />
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Support</h3>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Email" value={form.support?.email || ''} onChange={(e) => update('support', 'email', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Phone" value={form.support?.phone || ''} onChange={(e) => update('support', 'phone', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Hours" value={form.support?.hours || ''} onChange={(e) => update('support', 'hours', e.target.value)} />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Address</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Name" value={form.address?.name || ''} onChange={(e) => update('address', 'name', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Line 1" value={form.address?.line1 || ''} onChange={(e) => update('address', 'line1', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Line 2" value={form.address?.line2 || ''} onChange={(e) => update('address', 'line2', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="City" value={form.address?.city || ''} onChange={(e) => update('address', 'city', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Region" value={form.address?.region || ''} onChange={(e) => update('address', 'region', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Postal" value={form.address?.postal || ''} onChange={(e) => update('address', 'postal', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Country" value={form.address?.country || ''} onChange={(e) => update('address', 'country', e.target.value)} />
          </div>
        </div>

        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </section>
  );
}


