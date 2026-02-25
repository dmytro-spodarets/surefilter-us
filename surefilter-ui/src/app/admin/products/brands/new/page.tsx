'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function NewBrandPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    logoUrl: '',
    website: '',
    position: 0,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a brand name');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim() || null,
          description: formData.description.trim() || null,
          logoUrl: formData.logoUrl.trim() || null,
          website: formData.website.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Brand created successfully!');
        router.push('/admin/products/brands');
      } else {
        alert(data.error || 'Failed to create brand');
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      alert('Failed to create brand');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    // Extract S3 path from CDN URL
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    const s3Path = url.replace(cdnUrl + '/', '');
    setFormData({ ...formData, logoUrl: s3Path });
  };

  const getCdnUrl = (s3Path: string) => {
    if (!s3Path) return '';
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    return `${cdnUrl}/${s3Path}`;
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Brand</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new product brand
        </p>

      </div>

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
              placeholder="e.g., Sure Filter"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              The display name of the brand
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
              placeholder="e.g., SF"
              maxLength={20}
              pattern="[A-Z0-9]*"
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500 font-mono font-semibold"
            />
            <p className="mt-1 text-sm text-gray-500">
              Short code for ACES/PIES exports (uppercase letters and numbers only)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of this brand..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <div className="flex items-start gap-4">
              {formData.logoUrl && (
                <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-white p-2">
                  <Image
                    src={getCdnUrl(formData.logoUrl)}
                    alt="Brand logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formData.logoUrl ? 'Change Logo' : 'Select Logo'}
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="ml-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Upload or select a logo from the media library
                </p>
              </div>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Brand website URL
            </p>
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
              Order in which this brand appears (lower numbers appear first)
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
                Active (brand is visible and can be used)
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between rounded-b-lg">
          <Link
            href="/admin/products/brands"
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
                Creating...
              </>
            ) : (
              'Create Brand'
            )}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onSelect={handleMediaSelect}
        onClose={() => setShowMediaPicker(false)}
      />
      </div>
    </div>
  );
}
