'use client';

import { useState, useEffect } from 'react';
import MediaPickerModal from './MediaPickerModal';

interface ResourceFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailImage: string;
  file: string;
  fileType: string;
  fileSize: string;
  fileMeta: string;
  categoryId: string;
  formId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

interface ResourceFormProps {
  initialData?: Partial<ResourceFormData>;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
}

interface Form {
  id: string;
  name: string;
  slug: string;
}

export default function ResourceForm({ initialData, onSubmit, onCancel }: ResourceFormProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    thumbnailImage: initialData?.thumbnailImage || '',
    file: initialData?.file || '',
    fileType: initialData?.fileType || 'PDF',
    fileSize: initialData?.fileSize || '',
    fileMeta: initialData?.fileMeta || '',
    categoryId: initialData?.categoryId || '',
    formId: initialData?.formId || '',
    status: initialData?.status || 'DRAFT',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    ogImage: initialData?.ogImage || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showOgImagePicker, setShowOgImagePicker] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchForms();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/resource-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const generateSlug = (title: string) => {
    if (!initialData?.slug) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.description || !formData.file || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  generateSlug(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
              placeholder="Brief description for cards/previews"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
              rows={6}
              required
            />
          </div>
        </div>
      </div>

      {/* Files */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Files</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.thumbnailImage}
                onChange={(e) => setFormData({ ...formData, thumbnailImage: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                placeholder="S3 key or URL"
              />
              <button
                type="button"
                onClick={() => setShowThumbnailPicker(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Browse
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource File *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.file}
                onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                placeholder="S3 key for the downloadable file"
                required
              />
              <button
                type="button"
                onClick={() => setShowFilePicker(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Type *
              </label>
              <input
                type="text"
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                placeholder="PDF, Video, ZIP, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Size
              </label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                placeholder="15.2 MB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Meta
              </label>
              <input
                type="text"
                value={formData.fileMeta}
                onChange={(e) => setFormData({ ...formData, fileMeta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                placeholder="124 pages, 24 min, etc."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form (Optional)
              </label>
              <select
                value={formData.formId}
                onChange={(e) => setFormData({ ...formData, formId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
              >
                <option value="">No form (direct download)</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Users will fill this form before downloading</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
              required
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Publish date will be set automatically when status is changed to Published</p>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">SEO</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OG Image
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.ogImage}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowOgImagePicker(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Browse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Resource'}
        </button>
      </div>

      {/* Media Picker Modals */}
      {showThumbnailPicker && (
        <MediaPickerModal
          isOpen={showThumbnailPicker}
          onSelect={(url) => {
            setFormData({ ...formData, thumbnailImage: url });
            setShowThumbnailPicker(false);
          }}
          onClose={() => setShowThumbnailPicker(false)}
        />
      )}

      {showFilePicker && (
        <MediaPickerModal
          isOpen={showFilePicker}
          onSelect={(url) => {
            setFormData({ ...formData, file: url });
            setShowFilePicker(false);
          }}
          onClose={() => setShowFilePicker(false)}
        />
      )}

      {showOgImagePicker && (
        <MediaPickerModal
          isOpen={showOgImagePicker}
          onSelect={(url) => {
            setFormData({ ...formData, ogImage: url });
            setShowOgImagePicker(false);
          }}
          onClose={() => setShowOgImagePicker(false)}
        />
      )}
    </form>
  );
}

