'use client';

import { useState } from 'react';
import type { ContactFormInput } from '@/cms/schemas';

export default function ContactFormForm({ sectionId, initialData }: { sectionId: string; initialData: ContactFormInput }) {
  const [form, setForm] = useState<ContactFormInput>({ title: initialData.title || 'Send Us a Message', description: initialData.description || '', subjects: Array.isArray(initialData.subjects) ? initialData.subjects : [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSubject = (idx: number, key: keyof ContactFormInput['subjects'][number], value: string) => {
    setForm((f) => {
      const subjects = [...f.subjects];
      subjects[idx] = { ...(subjects[idx] as any), [key]: value } as any;
      return { ...f, subjects };
    });
  };
  const addSubject = () => setForm((f) => ({ ...f, subjects: [...f.subjects, { value: '', label: '' }] }));
  const removeSubject = (idx: number) => setForm((f) => ({ ...f, subjects: f.subjects.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'contact_form', data: form }) });
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Form</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Subjects</h3>
            <button type="button" onClick={addSubject} className="text-sure-blue-600 hover:underline text-sm">Add subject</button>
          </div>
          {form.subjects.map((s, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-gray-200 rounded-lg p-3">
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
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </section>
  );
}


