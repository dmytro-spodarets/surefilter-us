'use client';

import { useState } from 'react';

interface IndustryShowcaseOverrideFormProps {
  sectionId: string;
  initialData: {
    industryDescriptionOverride?: string;
  };
  sharedSectionData: {
    industryTitle?: string;
    industryDescription?: string;
  };
}

export default function IndustryShowcaseOverrideForm({
  sectionId,
  initialData,
  sharedSectionData,
}: IndustryShowcaseOverrideFormProps) {
  const [override, setOverride] = useState(initialData?.industryDescriptionOverride || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [useOverride, setUseOverride] = useState(!!initialData?.industryDescriptionOverride);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'industry_showcase',
          data: {
            industryDescriptionOverride: useOverride ? override : '',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to save');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving override:', error);
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Page-Specific Customization
      </h3>
      
      <p className="text-sm text-gray-600 mb-6">
        You can customize the Industry Description for this specific page while keeping all other content from the shared section.
      </p>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">✓ Changes saved successfully</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shared Section Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            From Shared Section: "{sharedSectionData.industryTitle}"
          </h4>
          <p className="text-sm text-gray-600 italic">
            {sharedSectionData.industryDescription || '(No description set)'}
          </p>
        </div>

        {/* Override Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="useOverride"
            checked={useOverride}
            onChange={(e) => setUseOverride(e.target.checked)}
            className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded focus:ring-sure-blue-500"
          />
          <label htmlFor="useOverride" className="text-sm font-medium text-gray-700">
            Use custom description for this page
          </label>
        </div>

        {/* Override Field */}
        {useOverride && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Industry Description (for this page only)
            </label>
            <textarea
              value={override}
              onChange={(e) => setOverride(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
              placeholder="Enter custom description for this page..."
            />
            <p className="mt-2 text-xs text-gray-500">
              This description will be shown only on this page. All other pages using this shared section will see the original description.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-sure-blue-600 text-white rounded-lg hover:bg-sure-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Override'}
          </button>
          
          {useOverride && override && (
            <button
              type="button"
              onClick={() => {
                setUseOverride(false);
                setOverride('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear and use shared description
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
