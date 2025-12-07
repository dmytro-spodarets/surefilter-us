'use client';

interface SpecParameter {
  id: string;
  code?: string | null;
  name: string;
  unit?: string | null;
  category?: string | null;
}

interface SpecValue {
  parameterId: string;
  value: string;
  unitOverride?: string;
  position: number;
}

interface SpecValuesSectionProps {
  specValues: SpecValue[];
  specParameters: SpecParameter[];
  onChange: (specValues: SpecValue[]) => void;
}

export default function SpecValuesSection({
  specValues,
  specParameters,
  onChange,
}: SpecValuesSectionProps) {
  
  const addSpecValue = () => {
    onChange([
      ...specValues,
      {
        parameterId: '',
        value: '',
        unitOverride: '',
        position: specValues.length,
      },
    ]);
  };

  const updateSpecValue = (index: number, field: keyof SpecValue, value: any) => {
    const updated = [...specValues];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSpecValue = (index: number) => {
    onChange(specValues.filter((_, i) => i !== index));
  };

  // Group parameters by category
  const parametersByCategory = specParameters.reduce((acc, param) => {
    const category = param.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(param);
    return acc;
  }, {} as Record<string, SpecParameter[]>);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Specifications</h2>
        <button
          type="button"
          onClick={addSpecValue}
          className="px-3 py-1.5 text-sm bg-sure-blue-600 text-white rounded-md hover:bg-sure-blue-700"
        >
          + Add Spec
        </button>
      </div>

      {specValues.length > 0 ? (
        <div className="space-y-3">
          {specValues.map((spec, index) => {
            const parameter = specParameters.find(p => p.id === spec.parameterId);
            
            return (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-md">
                {/* Parameter Select */}
                <div className="col-span-5">
                  <select
                    value={spec.parameterId}
                    onChange={(e) => updateSpecValue(index, 'parameterId', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  >
                    <option value="">Select parameter...</option>
                    {Object.entries(parametersByCategory).map(([category, params]) => (
                      <optgroup key={category} label={category}>
                        {params.map(param => (
                          <option key={param.id} value={param.id}>
                            {param.name} {param.unit && `(${param.unit})`}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div className="col-span-3">
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecValue(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  />
                </div>

                {/* Unit Override */}
                <div className="col-span-2">
                  <input
                    type="text"
                    value={spec.unitOverride || ''}
                    onChange={(e) => updateSpecValue(index, 'unitOverride', e.target.value)}
                    placeholder={parameter?.unit || 'Unit'}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  />
                </div>

                {/* Position */}
                <div className="col-span-1">
                  <input
                    type="number"
                    value={spec.position}
                    onChange={(e) => updateSpecValue(index, 'position', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  />
                </div>

                {/* Remove Button */}
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSpecValue(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No specifications added</p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Tip: Use position to control the order of specifications in the product display
      </p>
    </div>
  );
}
