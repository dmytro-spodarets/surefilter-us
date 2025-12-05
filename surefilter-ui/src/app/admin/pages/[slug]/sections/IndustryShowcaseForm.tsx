'use client';

import { useState } from 'react';

interface Metric {
  text: string;
  size: 'small' | 'medium' | 'large';
  image?: string;
}

interface FormData {
  industryTitle: string;
  industryDescription: string;
  brandPromise: string;
  keyFeatures: string[];
  metrics: Metric[];
}

export default function IndustryShowcaseForm({ sectionId, initialData }: { sectionId: string; initialData: any }) {
  const [form, setForm] = useState<FormData>({
    industryTitle: initialData?.industryTitle || '',
    industryDescription: initialData?.industryDescription || '',
    brandPromise: initialData?.brandPromise || '',
    keyFeatures: Array.isArray(initialData?.keyFeatures) ? initialData.keyFeatures : [],
    metrics: Array.isArray(initialData?.metrics) ? initialData.metrics : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Key Features handlers
  const addFeature = () => setForm(f => ({ ...f, keyFeatures: [...f.keyFeatures, ''] }));
  const updateFeature = (idx: number, value: string) => {
    setForm(f => {
      const keyFeatures = [...f.keyFeatures];
      keyFeatures[idx] = value;
      return { ...f, keyFeatures };
    });
  };
  const removeFeature = (idx: number) => setForm(f => ({ ...f, keyFeatures: f.keyFeatures.filter((_, i) => i !== idx) }));

  // Metrics handlers
  const addMetric = () => setForm(f => ({ ...f, metrics: [...f.metrics, { text: '', size: 'small', image: '' }] }));
  const updateMetricText = (idx: number, value: string) => {
    setForm(f => {
      const metrics = [...f.metrics];
      metrics[idx] = { ...metrics[idx], text: value };
      return { ...f, metrics };
    });
  };
  const updateMetricSize = (idx: number, value: 'small' | 'medium' | 'large') => {
    setForm(f => {
      const metrics = [...f.metrics];
      metrics[idx] = { ...metrics[idx], size: value };
      return { ...f, metrics };
    });
  };
  const updateMetricImage = (idx: number, value: string) => {
    setForm(f => {
      const metrics = [...f.metrics];
      metrics[idx] = { ...metrics[idx], image: value };
      return { ...f, metrics };
    });
  };
  const removeMetric = (idx: number) => setForm(f => ({ ...f, metrics: f.metrics.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'industry_showcase', data: form }),
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Save failed:', error);
        alert('Failed to save: ' + error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving: ' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Industry Showcase</h2>
      {saved && <p className="text-sm text-green-700 mb-3">✓ Saved</p>}
      
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Title *</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.industryTitle} 
              onChange={(e) => setForm({ ...form, industryTitle: e.target.value })}
              placeholder="Agriculture Industry"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Description *</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={4} 
              value={form.industryDescription} 
              onChange={(e) => setForm({ ...form, industryDescription: e.target.value })}
              placeholder="The agriculture industry encompasses..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Promise *</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              rows={3} 
              value={form.brandPromise} 
              onChange={(e) => setForm({ ...form, brandPromise: e.target.value })}
              placeholder="SURE FILTER® brand delivers..."
              required
            />
          </div>

        </div>

        {/* Key Features */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Key Features</h3>
            <button type="button" onClick={addFeature} className="text-sure-blue-600 hover:underline text-sm">
              + Add Feature
            </button>
          </div>
          {form.keyFeatures.map((feature, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                value={feature}
                onChange={(e) => updateFeature(idx, e.target.value)}
                placeholder="High-capacity filtration systems"
              />
              <button type="button" onClick={() => removeFeature(idx)} className="text-red-600 hover:underline text-sm px-2">
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Metrics</h3>
            <button type="button" onClick={addMetric} className="text-sure-blue-600 hover:underline text-sm">
              + Add Metric
            </button>
          </div>
          {form.metrics.map((metric, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Text *</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={metric.text}
                  onChange={(e) => updateMetricText(idx, e.target.value)}
                  placeholder="Over 8,000 SKUs of oil, air, fuel, cabin, transmission, hydraulic, separators and coolant filtration products"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Size *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={metric.size}
                    onChange={(e) => updateMetricSize(idx, e.target.value as 'small' | 'medium' | 'large')}
                  >
                    <option value="small">Small (1x1)</option>
                    <option value="medium">Medium (2x1)</option>
                    <option value="large">Large (2x2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Image URL (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={metric.image || ''}
                      onChange={(e) => updateMetricImage(idx, e.target.value)}
                      placeholder="images/filters/oil-filter.jpg or https://..."
                    />
                    <a
                      href="/admin/files"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                      Browse Files
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Open file manager, upload/select image, copy path (e.g. images/filters/oil-filter.jpg)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => removeMetric(idx)} className="text-sm text-red-600 hover:underline">
                  Remove Metric
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="border-t pt-4">
          <button 
            type="submit" 
            className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600 disabled:opacity-60" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
