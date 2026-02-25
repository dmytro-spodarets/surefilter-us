'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnailImage?: string;
  fileType: string;
  fileSize?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  form?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [statusFilter, categoryFilter, search]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/resource-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/resources?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      
      const data = await response.json();
      setResources(data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      alert('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete resource');
      }

      alert('Resource deleted successfully');
      fetchResources();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      alert(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-600 mt-1">Manage downloadable resources</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/resource-categories"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/resources/new"
              className="bg-sure-blue-600 hover:bg-sure-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Create Resource
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No resources found</p>
          <Link
            href="/admin/resources/new"
            className="inline-block mt-4 text-sure-blue-600 hover:text-sure-blue-700 font-medium"
          >
            Create your first resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Thumbnail */}
              {resource.thumbnailImage && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={resource.thumbnailImage}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                  <span className="text-xs text-gray-500">{resource.fileType}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>

                {resource.shortDescription && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {resource.shortDescription}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{resource.category.name}</span>
                  {resource.fileSize && <span>{resource.fileSize}</span>}
                </div>

                {resource.form && (
                  <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
                    <span className="text-blue-700">Form: {resource.form.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Link
                    href={`/admin/resources/${resource.id}/edit`}
                    className="text-sure-blue-600 hover:text-sure-blue-700 font-medium text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(resource.id, resource.title)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

