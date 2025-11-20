'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import MediaPickerModal from './MediaPickerModal';

interface NewsCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface NewsFormProps {
  articleId?: string;
  initialData?: any;
}

export default function NewsForm({ articleId, initialData }: NewsFormProps) {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFieldTarget, setMediaFieldTarget] = useState<'featuredImage' | 'ogImage' | null>(null);
  const [tinymceApiKey, setTinymceApiKey] = useState('no-api-key');
  
  const [formData, setFormData] = useState({
    slug: '',
    type: 'NEWS' as 'NEWS' | 'EVENT',
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageAlt: '',
    categoryId: '',
    tags: [] as string[],
    author: '',
    publishedAt: new Date().toISOString().slice(0, 16),
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    // Event fields
    eventStartDate: '',
    eventEndDate: '',
    eventUrl: '',
    isFeatured: false,
    venue: '',
    location: '',
    booth: '',
    hall: '',
    eventType: '',
    attendees: '',
    // SEO
    metaTitle: '',
    metaDescription: '',
    ogImage: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchTinymceConfig();
    if (initialData) {
      setFormData({
        ...initialData,
        tags: initialData.tags || [],
        publishedAt: initialData.publishedAt?.slice(0, 16) || new Date().toISOString().slice(0, 16),
        eventStartDate: initialData.eventStartDate?.slice(0, 16) || '',
        eventEndDate: initialData.eventEndDate?.slice(0, 16) || '',
        categoryId: initialData.categoryId || ''
      });
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/news-categories');
      const data = await response.json();
      setCategories(data.filter((cat: any) => cat.isActive));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTinymceConfig = async () => {
    try {
      const response = await fetch('/api/config/tinymce');
      const data = await response.json();
      setTinymceApiKey(data.apiKey);
    } catch (error) {
      console.error('Error fetching TinyMCE config:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = articleId 
        ? `/api/admin/news/${articleId}`
        : '/api/admin/news';
      
      const method = articleId ? 'PUT' : 'POST';
      
      // Get content from TinyMCE
      const content = editorRef.current?.getContent() || '';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content,
          categoryId: formData.categoryId || null,
          eventStartDate: formData.eventStartDate || null,
          eventEndDate: formData.eventEndDate || null
        })
      });

      if (response.ok) {
        router.push('/admin/news');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaFieldTarget === 'featuredImage') {
      setFormData({ ...formData, featuredImage: url });
    } else if (mediaFieldTarget === 'ogImage') {
      setFormData({ ...formData, ogImage: url });
    }
    setShowMediaPicker(false);
    setMediaFieldTarget(null);
  };

  const openMediaPicker = (field: 'featuredImage' | 'ogImage') => {
    setMediaFieldTarget(field);
    setShowMediaPicker(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'NEWS' | 'EVENT' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="NEWS">News Article</option>
                <option value="EVENT">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({
                  ...formData,
                  title,
                  slug: !articleId ? generateSlug(title) : formData.slug
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt (Short Description) *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              maxLength={250}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="150-250 characters"
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.excerpt.length}/250 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publish Date *
            </label>
            <input
              type="datetime-local"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Content</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Content *
          </label>
          <Editor
            apiKey={tinymceApiKey}
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue={formData.content}
            init={{
              height: 500,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </div>
      </div>

      {/* Featured Image */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Featured Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => openMediaPicker('featuredImage')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Browse
              </button>
            </div>
          </div>
          {formData.featuredImage && (
            <img src={formData.featuredImage} alt="Preview" className="max-w-md rounded-lg" />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Alt Text
            </label>
            <input
              type="text"
              value={formData.featuredImageAlt}
              onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Event Fields */}
      {formData.type === 'EVENT' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventStartDate}
                  onChange={(e) => setFormData({ ...formData, eventStartDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.type === 'EVENT'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventEndDate}
                  onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">⭐ Featured Event (show at top)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Las Vegas Convention Center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Las Vegas, NV"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booth
                </label>
                <input
                  type="text"
                  value={formData.booth}
                  onChange={(e) => setFormData({ ...formData, booth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. #C4521"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hall
                </label>
                <input
                  type="text"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Hall A4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendees
                </label>
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 140,000+"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <input
                  type="text"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Trade Show, Conference, Webinar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Website URL
                </label>
                <input
                  type="url"
                  value={formData.eventUrl}
                  onChange={(e) => setFormData({ ...formData, eventUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">SEO & Social Media</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty to use article title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty to use excerpt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OG Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.ogImage}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty to use featured image"
              />
              <button
                type="button"
                onClick={() => openMediaPicker('ogImage')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Browse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : articleId ? 'Update Article' : 'Create Article'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/news')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onSelect={handleMediaSelect}
        onClose={() => {
          setShowMediaPicker(false);
          setMediaFieldTarget(null);
        }}
      />
    </form>
  );
}

