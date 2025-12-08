'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import Image from 'next/image';
import SpecValuesSection from './components/SpecValuesSection';
import CrossReferencesSection from './components/CrossReferencesSection';
import MediaSection from './components/MediaSection';

// Types
interface Brand {
  id: string;
  name: string;
  code?: string | null;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductFilterType {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  icon?: string | null;
}

interface SpecParameter {
  id: string;
  code?: string | null;
  name: string;
  unit?: string | null;
  category?: string | null;
}

interface MediaAsset {
  id: string;
  s3Path: string;
  cdnUrl: string;
  filename: string;
}

interface ProductFormData {
  code: string;
  name: string;
  description: string;
  brandId: string;
  filterTypeId: string;
  status: string;
  tags: string[];
  manufacturer: string;
  industries: string[];
  
  // Many-to-many categories
  categoryAssignments: Array<{
    categoryId: string;
    isPrimary: boolean;
    position: number;
  }>;
  
  // Spec values
  specValues: Array<{
    parameterId: string;
    value: string;
    unitOverride?: string;
    position: number;
  }>;
  
  // Media
  mediaItems: Array<{
    assetId: string;
    isPrimary: boolean;
    position: number;
    caption?: string;
  }>;
  
  // Cross references (OEMs)
  crossReferences: Array<{
    refBrandName: string;
    refCode: string;
    referenceType: string;
    isPreferred: boolean;
    notes?: string;
  }>;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  brands: Brand[];
  categories: ProductCategory[];
  filterTypes: ProductFilterType[];
  specParameters: SpecParameter[];
}

export default function ProductFormNew({
  mode,
  productId,
  brands,
  categories,
  filterTypes,
  specParameters,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    name: '',
    description: '',
    brandId: '',
    filterTypeId: '',
    status: 'Active',
    tags: [],
    manufacturer: '',
    industries: [],
    categoryAssignments: [],
    specValues: [],
    mediaItems: [],
    crossReferences: [],
  });

  // Load existing product data
  useEffect(() => {
    if (mode === 'edit' && productId) {
      loadProduct();
    }
  }, [mode, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          code: data.code,
          name: data.name,
          description: data.description || '',
          brandId: data.brandId,
          filterTypeId: data.filterTypeId || '',
          status: data.status || 'Active',
          tags: data.tags || [],
          manufacturer: data.manufacturer || '',
          industries: data.industries || [],
          categoryAssignments: data.categories?.map((c: any) => ({
            categoryId: c.categoryId,
            isPrimary: c.isPrimary,
            position: c.position,
          })) || [],
          specValues: data.specValues?.map((sv: any) => ({
            parameterId: sv.parameterId,
            value: sv.value,
            unitOverride: sv.unitOverride,
            position: sv.position,
          })) || [],
          mediaItems: data.media?.map((m: any) => ({
            assetId: m.assetId,
            isPrimary: m.isPrimary,
            position: m.position,
            caption: m.caption,
          })) || [],
          crossReferences: data.crossReferences?.map((cr: any) => ({
            refBrandName: cr.refBrandName,
            refCode: cr.refCode,
            referenceType: cr.referenceType,
            isPreferred: cr.isPreferred,
            notes: cr.notes,
          })) || [],
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brandId) {
      alert('Please select a brand');
      return;
    }

    try {
      setSaving(true);
      const url = mode === 'create' 
        ? '/api/admin/products'
        : `/api/admin/products/${productId}`;
      
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        router.push('/admin/products');
      } else {
        alert(data.error || `Failed to ${mode} product`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully');
        router.push('/admin/products');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  // Category management
  const addCategory = (categoryId: string) => {
    if (formData.categoryAssignments.find(c => c.categoryId === categoryId)) {
      return;
    }
    setFormData({
      ...formData,
      categoryAssignments: [
        ...formData.categoryAssignments,
        {
          categoryId,
          isPrimary: formData.categoryAssignments.length === 0,
          position: formData.categoryAssignments.length,
        },
      ],
    });
  };

  const removeCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      categoryAssignments: formData.categoryAssignments.filter(c => c.categoryId !== categoryId),
    });
  };

  const setPrimaryCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      categoryAssignments: formData.categoryAssignments.map(c => ({
        ...c,
        isPrimary: c.categoryId === categoryId,
      })),
    });
  };

  // Spec value management
  const addSpecValue = () => {
    setFormData({
      ...formData,
      specValues: [
        ...formData.specValues,
        {
          parameterId: '',
          value: '',
          unitOverride: '',
          position: formData.specValues.length,
        },
      ],
    });
  };

  const updateSpecValue = (index: number, field: string, value: any) => {
    const updated = [...formData.specValues];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, specValues: updated });
  };

  const removeSpecValue = (index: number) => {
    setFormData({
      ...formData,
      specValues: formData.specValues.filter((_, i) => i !== index),
    });
  };

  // Cross reference management
  const addCrossReference = () => {
    setFormData({
      ...formData,
      crossReferences: [
        ...formData.crossReferences,
        {
          refBrandName: '',
          refCode: '',
          referenceType: 'OEM',
          isPreferred: false,
          notes: '',
        },
      ],
    });
  };

  const updateCrossReference = (index: number, field: string, value: any) => {
    const updated = [...formData.crossReferences];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, crossReferences: updated });
  };

  const removeCrossReference = (index: number) => {
    setFormData({
      ...formData,
      crossReferences: formData.crossReferences.filter((_, i) => i !== index),
    });
  };

  // Media management
  const handleMediaSelect = (cdnUrl: string, assetId?: string) => {
    if (!assetId) {
      console.error('No assetId provided for media');
      alert('Error: Media asset ID not found. Please try uploading the image again.');
      return;
    }
    
    setFormData({
      ...formData,
      mediaItems: [
        ...formData.mediaItems,
        {
          assetId,
          isPrimary: formData.mediaItems.length === 0,
          position: formData.mediaItems.length,
          caption: '',
        },
      ],
    });
  };

  const removeMedia = (index: number) => {
    setFormData({
      ...formData,
      mediaItems: formData.mediaItems.filter((_, i) => i !== index),
    });
  };

  const setPrimaryMedia = (index: number) => {
    setFormData({
      ...formData,
      mediaItems: formData.mediaItems.map((m, i) => ({
        ...m,
        isPrimary: i === index,
      })),
    });
  };

  const getCdnUrl = (s3Path: string) => {
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    return `${cdnUrl}/${s3Path}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center text-gray-500">Loading product...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === 'create' ? 'Create Product' : 'Edit Product'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                  placeholder="e.g., SFO241"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} {brand.code && `(${brand.code})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                placeholder="e.g., Heavy Duty Oil Filter"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Type
                </label>
                <select
                  value={formData.filterTypeId}
                  onChange={(e) => setFormData({ ...formData, filterTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                >
                  <option value="">Select filter type...</option>
                  {filterTypes.map(ft => (
                    <option key={ft.id} value={ft.id}>
                      {ft.icon && `${ft.icon} `}{ft.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Discontinued">Discontinued</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
                placeholder="e.g., HYUNDAI, CAT"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Category
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addCategory(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
              >
                <option value="">Select a category...</option>
                {categories
                  .filter(cat => !formData.categoryAssignments.find(c => c.categoryId === cat.id))
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {formData.categoryAssignments.length > 0 ? (
              <div className="space-y-2">
                {formData.categoryAssignments.map((assignment) => {
                  const category = categories.find(c => c.id === assignment.categoryId);
                  if (!category) return null;
                  
                  return (
                    <div
                      key={assignment.categoryId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{category.name}</span>
                        {assignment.isPrimary && (
                          <span className="px-2 py-0.5 text-xs bg-sure-blue-100 text-sure-blue-800 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!assignment.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryCategory(assignment.categoryId)}
                            className="text-sm text-sure-blue-600 hover:text-sure-blue-800"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCategory(assignment.categoryId)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No categories assigned</p>
            )}
          </div>

          {/* Specifications */}
          <SpecValuesSection
            specValues={formData.specValues}
            specParameters={specParameters}
            onChange={(specValues) => setFormData({ ...formData, specValues })}
          />

          {/* Media/Images */}
          <MediaSection
            mediaItems={formData.mediaItems}
            onChange={(mediaItems) => setFormData({ ...formData, mediaItems })}
            onOpenPicker={() => setShowMediaPicker(true)}
          />

          {/* Cross References (OEMs) */}
          <CrossReferencesSection
            crossReferences={formData.crossReferences}
            onChange={(crossReferences) => setFormData({ ...formData, crossReferences })}
          />
          
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-sure-blue-600 text-white rounded-md hover:bg-sure-blue-700 disabled:opacity-50 mb-2"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>

            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Product
              </button>
            )}
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onSelect={handleMediaSelect}
        onClose={() => setShowMediaPicker(false)}
      />
    </form>
  );
}
