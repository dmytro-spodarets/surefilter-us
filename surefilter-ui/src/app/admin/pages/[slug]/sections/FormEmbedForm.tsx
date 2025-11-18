'use client';

import { useState, useEffect } from 'react';
import type { FormEmbedInput } from '@/cms/schemas';

interface Form {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function FormEmbedForm({ 
  sectionId, 
  initialData 
}: { 
  sectionId: string; 
  initialData: FormEmbedInput 
}) {
  const [form, setForm] = useState<FormEmbedInput>({
    formId: initialData.formId || '',
    title: initialData.title || '',
    description: initialData.description || '',
  });
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      alert('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.formId) {
      alert('Please select a form');
      return;
    }

    setSaving(true);
    setSaved(false);
    
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'form_embed', data: form }),
      });

      if (!response.ok) throw new Error('Failed to save section');

      setSaved(true);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const selectedForm = forms.find(f => f.id === form.formId);

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Form Embed</h2>
      <p className="text-sm text-gray-600 mb-4">
        Embed a universal form into this page. The form will be fully interactive with submission tracking.
      </p>
      
      {saved && <p className="text-sm text-green-700 mb-3">✓ Saved successfully</p>}
      
      <form onSubmit={onSubmit} className="grid gap-4">
        {/* Form Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Form <span className="text-red-500">*</span>
          </label>
          {loading ? (
            <div className="text-sm text-gray-500">Loading forms...</div>
          ) : (
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sure-blue-500"
              value={form.formId}
              onChange={(e) => setForm({ ...form, formId: e.target.value })}
              required
            >
              <option value="">-- Select a form --</option>
              {forms
                .filter(f => f.isActive)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.slug})
                  </option>
                ))}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Choose which form to display on this page. Only active forms are shown.
          </p>
          {forms.length === 0 && !loading && (
            <p className="text-sm text-orange-600 mt-2">
              No forms available. <a href="/admin/forms/new" className="text-sure-blue-600 hover:underline">Create a form first</a>
            </p>
          )}
        </div>

        {/* Form Preview Info */}
        {selectedForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Selected Form</p>
            <p className="text-sm text-blue-800">{selectedForm.name}</p>
            <p className="text-xs text-blue-600 mt-1">Slug: {selectedForm.slug}</p>
            <a 
              href={`/admin/forms/${selectedForm.id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sure-blue-600 hover:underline mt-2 inline-block"
            >
              Edit this form →
            </a>
          </div>
        )}

        {/* Optional Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title (Optional)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sure-blue-500"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Get in Touch"
          />
          <p className="text-xs text-gray-500 mt-1">
            Heading displayed above the form. Leave empty to hide.
          </p>
        </div>

        {/* Optional Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Description (Optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sure-blue-500"
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g., Fill out the form below and we'll get back to you within 24 hours."
          />
          <p className="text-xs text-gray-500 mt-1">
            Additional text displayed above the form. Leave empty to hide.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="bg-sure-orange-500 text-white rounded-lg px-6 py-2 hover:bg-sure-orange-600 transition-colors disabled:opacity-50"
            disabled={saving || !form.formId}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

