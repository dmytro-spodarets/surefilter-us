'use client';

import { useState } from 'react';
import type { ContactFormInfoInput } from '@/cms/schemas';

export default function ContactFormInfoForm({ sectionId, initialData }: { sectionId: string; initialData: ContactFormInfoInput }) {
  const [data, setData] = useState<ContactFormInfoInput>({
    form: initialData.form || { title: 'Send Us a Message', description: '', subjects: [] },
    info: initialData.info || { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSubject = (idx: number, key: keyof (typeof data.form.subjects)[number], value: string) => {
    setData((d) => {
      const subjects = Array.isArray(d.form.subjects) ? [...d.form.subjects] : [];
      subjects[idx] = { ...(subjects[idx] as any), [key]: value } as any;
      return { ...d, form: { ...d.form, subjects } };
    });
  };
  const addSubject = () => setData((d) => ({ ...d, form: { ...d.form, subjects: [...(d.form.subjects || []), { value: '', label: '' }] } }));
  const removeSubject = (idx: number) => setData((d) => ({ ...d, form: { ...d.form, subjects: (d.form.subjects || []).filter((_, i) => i !== idx) } }));

  const updateInfo = (group: 'general' | 'support' | 'address', key: string, value: string) => {
    setData((d) => ({ ...d, info: { ...d.info, [group]: { ...(d.info as any)[group], [key]: value } as any } }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch(`/api/admin/sections/${sectionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'contact_form_info', data }) });
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Form + Info</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Form part */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Form</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={data.form.title || ''} onChange={(e) => setData({ ...data, form: { ...data.form, title: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={data.form.description || ''} onChange={(e) => setData({ ...data, form: { ...data.form, description: e.target.value } })} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Subjects</h4>
              <button type="button" onClick={addSubject} className="text-sure-blue-600 hover:underline text-sm">Add subject</button>
            </div>
            {(data.form.subjects || []).map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-gray-200 rounded-lg p-3 mt-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Value</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={s.value} onChange={(e) => updateSubject(idx, 'value', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Label</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={s.label} onChange={(e) => updateSubject(idx, 'label', e.target.value)} />
                </div>
                <div className="md:col-span-2 text-right">
                  <button type="button" onClick={() => removeSubject(idx)} className="text-sm text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info part */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Info</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">General</h4>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Email" value={data.info?.general?.email || ''} onChange={(e) => updateInfo('general', 'email', e.target.value)} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Phone" value={data.info?.general?.phone || ''} onChange={(e) => updateInfo('general', 'phone', e.target.value)} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Fax" value={data.info?.general?.fax || ''} onChange={(e) => updateInfo('general', 'fax', e.target.value)} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Support</h4>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Email" value={data.info?.support?.email || ''} onChange={(e) => updateInfo('support', 'email', e.target.value)} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" placeholder="Phone" value={data.info?.support?.phone || ''} onChange={(e) => updateInfo('support', 'phone', e.target.value)} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Hours" value={data.info?.support?.hours || ''} onChange={(e) => updateInfo('support', 'hours', e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Name" value={data.info?.address?.name || ''} onChange={(e) => updateInfo('address', 'name', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Line 1" value={data.info?.address?.line1 || ''} onChange={(e) => updateInfo('address', 'line1', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Line 2" value={data.info?.address?.line2 || ''} onChange={(e) => updateInfo('address', 'line2', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="City" value={data.info?.address?.city || ''} onChange={(e) => updateInfo('address', 'city', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Region" value={data.info?.address?.region || ''} onChange={(e) => updateInfo('address', 'region', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Postal" value={data.info?.address?.postal || ''} onChange={(e) => updateInfo('address', 'postal', e.target.value)} />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Country" value={data.info?.address?.country || ''} onChange={(e) => updateInfo('address', 'country', e.target.value)} />
          </div>
        </div>

        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </section>
  );
}


