'use client';

import { useState, useEffect } from 'react';
import type { ContactFormInfoInput } from '@/cms/schemas';

interface Form {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export default function ContactFormInfoForm({ sectionId, initialData }: { sectionId: string; initialData: ContactFormInfoInput }) {
  const [data, setData] = useState<ContactFormInfoInput>({
    formId: initialData.formId || null,
    formSlug: initialData.formSlug || null,
    formTitle: initialData.formTitle || 'Send Us a Message',
    formDescription: initialData.formDescription || '',
    
    generalTitle: initialData.generalTitle || 'General Inquiries',
    generalEmail: initialData.generalEmail || '',
    generalPhone: initialData.generalPhone || '',
    generalFax: initialData.generalFax || '',
    
    supportTitle: initialData.supportTitle || 'Technical Support',
    supportEmail: initialData.supportEmail || '',
    supportPhone: initialData.supportPhone || '',
    supportHours: initialData.supportHours || '',
    
    addressTitle: initialData.addressTitle || 'Office Address',
    addressName: initialData.addressName || '',
    addressLine1: initialData.addressLine1 || '',
    addressLine2: initialData.addressLine2 || '',
    addressCity: initialData.addressCity || '',
    addressRegion: initialData.addressRegion || '',
    addressPostal: initialData.addressPostal || '',
    addressCountry: initialData.addressCountry || '',
  });
  
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available forms
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const result = await response.json();
        setForms(result.forms || []);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoadingForms(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    
    const res = await fetch(`/api/admin/sections/${sectionId}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ type: 'contact_form_info', data }) 
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Form + Info</h2>
      {saved && <p className="text-sm text-green-700 mb-3">✓ Saved</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Form Selection */}
        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-gray-900 mb-3">📝 Form Configuration</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Select Form
                <span className="text-gray-500 font-normal ml-2">(from Universal Forms)</span>
              </label>
              {loadingForms ? (
                <p className="text-sm text-gray-500">Loading forms...</p>
              ) : (
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.formId || ''}
                  onChange={(e) => {
                    const selectedForm = forms.find(f => f.id === e.target.value);
                    setData({ 
                      ...data, 
                      formId: e.target.value || null,
                      formSlug: selectedForm?.slug || null
                    });
                  }}
                >
                  <option value="">-- No form (show placeholder) --</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name} ({form.type})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-2">
                💡 Create forms in <a href="/admin/forms" target="_blank" className="text-sure-blue-600 hover:underline">Forms Manager</a>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Form Title</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.formTitle}
                  onChange={(e) => setData({ ...data, formTitle: e.target.value })}
                  placeholder="Send Us a Message"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Form Description/Warning</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  value={data.formDescription}
                  onChange={(e) => setData({ ...data, formDescription: e.target.value })}
                  placeholder="Optional warning or description text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Block 1: General Inquiries */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>📞</span>
            General Inquiries
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={data.generalTitle}
                onChange={(e) => setData({ ...data, generalTitle: e.target.value })}
                placeholder="General Inquiries"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.generalEmail}
                  onChange={(e) => setData({ ...data, generalEmail: e.target.value })}
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.generalPhone}
                  onChange={(e) => setData({ ...data, generalPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Fax</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.generalFax}
                  onChange={(e) => setData({ ...data, generalFax: e.target.value })}
                  placeholder="+1 (555) 123-4568"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Block 2: Technical Support */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>🔧</span>
            Technical Support
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={data.supportTitle}
                onChange={(e) => setData({ ...data, supportTitle: e.target.value })}
                placeholder="Technical Support"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.supportEmail}
                  onChange={(e) => setData({ ...data, supportEmail: e.target.value })}
                  placeholder="support@company.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.supportPhone}
                  onChange={(e) => setData({ ...data, supportPhone: e.target.value })}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Hours</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.supportHours}
                  onChange={(e) => setData({ ...data, supportHours: e.target.value })}
                  placeholder="Mon-Fri 9AM-5PM EST"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Block 3: Office Address */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>🏢</span>
            Office Address
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={data.addressTitle}
                onChange={(e) => setData({ ...data, addressTitle: e.target.value })}
                placeholder="Office Address"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company Name</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressName}
                  onChange={(e) => setData({ ...data, addressName: e.target.value })}
                  placeholder="Sure Filter Inc."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address Line 1</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressLine1}
                  onChange={(e) => setData({ ...data, addressLine1: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address Line 2</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressLine2}
                  onChange={(e) => setData({ ...data, addressLine2: e.target.value })}
                  placeholder="Suite 100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">City</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressCity}
                  onChange={(e) => setData({ ...data, addressCity: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">State/Region</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressRegion}
                  onChange={(e) => setData({ ...data, addressRegion: e.target.value })}
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Postal/ZIP Code</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressPostal}
                  onChange={(e) => setData({ ...data, addressPostal: e.target.value })}
                  placeholder="10001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Country</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={data.addressCountry}
                  onChange={(e) => setData({ ...data, addressCountry: e.target.value })}
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            className="bg-sure-orange-500 text-white rounded-lg px-6 py-2 hover:bg-sure-orange-600 transition-colors" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
