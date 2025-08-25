'use client';

import { useState } from 'react';
import type { ContactDetailsInput } from '@/cms/schemas';

export default function ContactDetailsForm({ sectionId, initialData }: { sectionId: string; initialData: ContactDetailsInput }) {
  const [form, setForm] = useState<ContactDetailsInput>({
    options: initialData.options || { phone: '', chatHref: '#', askHref: '#contact-form' },
    info: initialData.info,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'contact_details', data: form }) });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Options</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Phone" value={form.options?.phone || ''} onChange={(e) => setForm({ ...form, options: { ...(form.options || {}), phone: e.target.value } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Chat href" value={form.options?.chatHref || ''} onChange={(e) => setForm({ ...form, options: { ...(form.options || {}), chatHref: e.target.value } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ask href" value={form.options?.askHref || ''} onChange={(e) => setForm({ ...form, options: { ...(form.options || {}), askHref: e.target.value } })} />
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Info</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">General</h4>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Email" value={form.info?.general?.email || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, general: { ...(form.info?.general || {}), email: e.target.value } } })} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Phone" value={form.info?.general?.phone || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, general: { ...(form.info?.general || {}), phone: e.target.value } } })} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Fax" value={form.info?.general?.fax || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, general: { ...(form.info?.general || {}), fax: e.target.value } } })} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Support</h4>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Email" value={form.info?.support?.email || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, support: { ...(form.info?.support || {}), email: e.target.value } } })} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Phone" value={form.info?.support?.phone || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, support: { ...(form.info?.support || {}), phone: e.target.value } } })} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Hours" value={form.info?.support?.hours || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, support: { ...(form.info?.support || {}), hours: e.target.value } } })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Name" value={form.info?.address?.name || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), name: e.target.value } } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Line 1" value={form.info?.address?.line1 || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), line1: e.target.value } } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Line 2" value={form.info?.address?.line2 || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), line2: e.target.value } } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="City" value={form.info?.address?.city || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), city: e.target.value } } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Region" value={form.info?.address?.region || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), region: e.target.value } } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Postal" value={form.info?.address?.postal || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), postal: e.target.value } } })} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Country" value={form.info?.address?.country || ''} onChange={(e) => setForm({ ...form, info: { ...form.info, address: { ...(form.info?.address || {}), country: e.target.value } } })} />
          </div>
        </div>
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </section>
  );
}


