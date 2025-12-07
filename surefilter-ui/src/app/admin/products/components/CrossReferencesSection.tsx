'use client';

interface CrossReference {
  refBrandName: string;
  refCode: string;
  referenceType: string;
  isPreferred: boolean;
  notes?: string;
}

interface CrossReferencesSectionProps {
  crossReferences: CrossReference[];
  onChange: (crossReferences: CrossReference[]) => void;
}

export default function CrossReferencesSection({
  crossReferences,
  onChange,
}: CrossReferencesSectionProps) {
  
  const addCrossReference = () => {
    onChange([
      ...crossReferences,
      {
        refBrandName: '',
        refCode: '',
        referenceType: 'OEM',
        isPreferred: false,
        notes: '',
      },
    ]);
  };

  const updateCrossReference = (index: number, field: keyof CrossReference, value: any) => {
    const updated = [...crossReferences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCrossReference = (index: number) => {
    onChange(crossReferences.filter((_, i) => i !== index));
  };

  const referenceTypes = ['OEM', 'Competitor', 'Supersedes', 'Superseded By'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Cross References</h2>
          <p className="text-sm text-gray-500 mt-1">OEM numbers and competitor cross-references</p>
        </div>
        <button
          type="button"
          onClick={addCrossReference}
          className="px-3 py-1.5 text-sm bg-sure-blue-600 text-white rounded-md hover:bg-sure-blue-700"
        >
          + Add Reference
        </button>
      </div>

      {crossReferences.length > 0 ? (
        <div className="space-y-4">
          {crossReferences.map((ref, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Brand Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Brand/Manufacturer
                  </label>
                  <input
                    type="text"
                    value={ref.refBrandName}
                    onChange={(e) => updateCrossReference(index, 'refBrandName', e.target.value)}
                    placeholder="e.g., HYUNDAI, Fleetguard, Baldwin"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  />
                </div>

                {/* Part Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Part Number
                  </label>
                  <input
                    type="text"
                    value={ref.refCode}
                    onChange={(e) => updateCrossReference(index, 'refCode', e.target.value)}
                    placeholder="e.g., 26300-35503"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  />
                </div>

                {/* Reference Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={ref.referenceType}
                    onChange={(e) => updateCrossReference(index, 'referenceType', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  >
                    {referenceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Preferred */}
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ref.isPreferred}
                      onChange={(e) => updateCrossReference(index, 'isPreferred', e.target.checked)}
                      className="h-4 w-4 text-sure-blue-600 focus:ring-sure-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Preferred/Primary
                    </span>
                  </label>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={ref.notes || ''}
                    onChange={(e) => updateCrossReference(index, 'notes', e.target.value)}
                    placeholder="Additional notes about this cross reference..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  />
                </div>
              </div>

              {/* Remove Button */}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeCrossReference(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Reference
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No cross references added</p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Tip: Mark one reference as "Preferred" to highlight it in search results
      </p>
    </div>
  );
}
