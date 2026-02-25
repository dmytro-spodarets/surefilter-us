'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SpecParameter {
  id: string;
  code?: string | null;
  name: string;
  unit?: string | null;
  category?: string | null;
  position: number;
  isActive: boolean;
  _count: {
    values: number;
  };
}

export default function EditSpecParameterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parameter, setParameter] = useState<SpecParameter | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: '',
    category: '',
    position: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchParameter();
  }, [id]);

  const fetchParameter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/spec-parameters/${id}`);
      const data = await response.json();

      if (response.ok) {
        setParameter(data);
        setFormData({
          code: data.code || '',
          name: data.name,
          unit: data.unit || '',
          category: data.category || '',
          position: data.position,
          isActive: data.isActive,
        });
      } else {
        alert('Parameter not found');
        router.push('/admin/products/spec-parameters');
      }
    } catch (error) {
      console.error('Error fetching parameter:', error);
      alert('Failed to load parameter');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a parameter name');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/spec-parameters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim() || null,
          unit: formData.unit.trim() || null,
          category: formData.category.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Parameter updated successfully!');
        router.push('/admin/products/spec-parameters');
      } else {
        alert(data.error || 'Failed to update parameter');
      }
    } catch (error) {
      console.error('Error updating parameter:', error);
      alert('Failed to update parameter');
    } finally {
      setSaving(false);
    }
  };

  const commonCategories = ['Dimensions', 'Performance', 'Physical', 'Material'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">Loading parameter...</div>
      </div>
    );
  }

  if (!parameter) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Specification Parameter</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update parameter information
        </p>

      </div>

      {/* Usage Info */}
      {parameter._count.values > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Parameter in use</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This parameter is used in {parameter._count.values} product {parameter._count.values === 1 ? 'specification' : 'specifications'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Height, Outer Diameter, Thread"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              The display name of the parameter
            </p>
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., HEIGHT, OD, THREAD"
              maxLength={50}
              pattern="[A-Z0-9_]*"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500 font-mono font-semibold"
            />
            <p className="mt-1 text-sm text-gray-500">
              Stable code for ACES/PIES exports (uppercase letters, numbers, and underscores only)
            </p>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., mm, in, psi"
              maxLength={20}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Default unit of measurement (can be overridden per product)
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Dimensions"
                maxLength={50}
                list="category-suggestions"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
              />
              <datalist id="category-suggestions">
                {commonCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Category for grouping parameters (e.g., Dimensions, Performance)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Order within category (lower numbers appear first)
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-sure-blue-600 focus:ring-sure-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Active (parameter is visible and can be used)
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between rounded-b-lg">
          <Link
            href="/admin/products/spec-parameters"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sure-blue-600 hover:bg-sure-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
