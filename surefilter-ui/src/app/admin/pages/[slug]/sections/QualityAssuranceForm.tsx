'use client';

import { useState } from 'react';
import type { QualityAssuranceInput } from '@/cms/schemas';

interface TestingProcedure {
  name?: string;
  description?: string;
}

export default function QualityAssuranceForm({ sectionId, initialData }: { sectionId: string; initialData: QualityAssuranceInput }) {
  const [form, setForm] = useState<QualityAssuranceInput>({
    title: initialData.title,
    subtitle: initialData.subtitle,
    manufacturingImage: initialData.manufacturingImage,
    manufacturingText1: initialData.manufacturingText1,
    manufacturingText2: initialData.manufacturingText2,
    certificationTitle: initialData.certificationTitle,
    certificationText: initialData.certificationText,
    testingTitle: initialData.testingTitle,
    testingSubtitle: initialData.testingSubtitle,
    testingProcedures: initialData.testingProcedures || [],
    promiseText: initialData.promiseText,
    promiseTagline: initialData.promiseTagline,
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
      body: JSON.stringify({ type: 'quality_assurance', data: form }),
    });
    
    setSaving(false);
    if (!res.ok) {
      const t = await res.text();
      setError(t || 'Save failed');
      return;
    }
    setSaved(true);
  };

  const addTestingProcedure = () => {
    setForm({
      ...form,
      testingProcedures: [...(form.testingProcedures || []), { name: '', description: '' }],
    });
  };

  const removeTestingProcedure = (index: number) => {
    const procedures = [...(form.testingProcedures || [])];
    procedures.splice(index, 1);
    setForm({ ...form, testingProcedures: procedures });
  };

  const updateTestingProcedure = (index: number, field: 'name' | 'description', value: string) => {
    const procedures = [...(form.testingProcedures || [])];
    procedures[index] = { ...procedures[index], [field]: value };
    setForm({ ...form, testingProcedures: procedures });
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quality Assurance</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Header Section */}
        <div className="grid gap-4">
          <h3 className="text-md font-medium text-gray-900">Header</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.title ?? ''} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={2}
              value={form.subtitle ?? ''} 
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
            />
          </div>
        </div>

        {/* Manufacturing Section */}
        <div className="border-t border-gray-200 pt-4 grid gap-4">
          <h3 className="text-md font-medium text-gray-900">Manufacturing</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Manufacturing Image URL</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              placeholder="URL or S3 path"
              value={form.manufacturingImage ?? ''} 
              onChange={(e) => setForm({ ...form, manufacturingImage: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Manufacturing Text 1</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={3}
              value={form.manufacturingText1 ?? ''} 
              onChange={(e) => setForm({ ...form, manufacturingText1: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Manufacturing Text 2</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={3}
              value={form.manufacturingText2 ?? ''} 
              onChange={(e) => setForm({ ...form, manufacturingText2: e.target.value })} 
            />
          </div>
        </div>

        {/* Certification Section */}
        <div className="border-t border-gray-200 pt-4 grid gap-4">
          <h3 className="text-md font-medium text-gray-900">Certification</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Certification Title</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.certificationTitle ?? ''} 
              onChange={(e) => setForm({ ...form, certificationTitle: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Certification Text</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={4}
              value={form.certificationText ?? ''} 
              onChange={(e) => setForm({ ...form, certificationText: e.target.value })} 
            />
          </div>
        </div>

        {/* Testing Section */}
        <div className="border-t border-gray-200 pt-4 grid gap-4">
          <h3 className="text-md font-medium text-gray-900">Laboratory Testing</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Testing Title</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.testingTitle ?? ''} 
              onChange={(e) => setForm({ ...form, testingTitle: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Testing Subtitle</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={2}
              value={form.testingSubtitle ?? ''} 
              onChange={(e) => setForm({ ...form, testingSubtitle: e.target.value })} 
            />
          </div>

          {/* Testing Procedures */}
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Testing Procedures</label>
              <button
                type="button"
                onClick={addTestingProcedure}
                className="text-sm bg-sure-blue-500 text-white rounded px-3 py-1 hover:bg-sure-blue-600"
              >
                + Add Procedure
              </button>
            </div>
            {(form.testingProcedures || []).map((procedure, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Procedure {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeTestingProcedure(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Procedure name"
                  value={procedure.name ?? ''}
                  onChange={(e) => updateTestingProcedure(index, 'name', e.target.value)}
                />
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Procedure description"
                  value={procedure.description ?? ''}
                  onChange={(e) => updateTestingProcedure(index, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Promise Section */}
        <div className="border-t border-gray-200 pt-4 grid gap-4">
          <h3 className="text-md font-medium text-gray-900">Quality Promise</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Promise Text</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={3}
              value={form.promiseText ?? ''} 
              onChange={(e) => setForm({ ...form, promiseText: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Promise Tagline</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.promiseTagline ?? ''} 
              onChange={(e) => setForm({ ...form, promiseTagline: e.target.value })} 
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600 disabled:opacity-50" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}


