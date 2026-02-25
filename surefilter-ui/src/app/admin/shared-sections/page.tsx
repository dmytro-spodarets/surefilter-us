'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface SharedSection {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    sections: number;
  };
}

export default function SharedSectionsPage() {
  const router = useRouter();
  const [sharedSections, setSharedSections] = useState<SharedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadSharedSections();
  }, [filterType]);

  const loadSharedSections = async () => {
    try {
      const url = filterType 
        ? `/api/admin/shared-sections?type=${filterType}`
        : '/api/admin/shared-sections';
      
      const response = await fetch(url);
      const data = await response.json();
      setSharedSections(data.sharedSections || []);
    } catch (error) {
      console.error('Error loading shared sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, usageCount: number) => {
    if (usageCount > 0) {
      alert(`Cannot delete: This shared section is used on ${usageCount} page(s)`);
      return;
    }

    if (!confirm('Are you sure you want to delete this shared section?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/shared-sections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadSharedSections();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting shared section:', error);
      alert('Failed to delete shared section');
    }
  };

  const getSectionTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shared Sections</h1>
            <p className="text-gray-600 mt-2">
              Create reusable sections that can be used across multiple pages
            </p>
          </div>
          <Link
            href="/admin/shared-sections/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            New Shared Section
          </Link>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-64"
          >
            <option value="">All types</option>
            <option value="hero_full">Hero Full</option>
            <option value="about_with_stats">About With Stats</option>
            <option value="contact_form">Contact Form</option>
            <option value="industry_showcase">Industry Showcase</option>
            {/* Add more types as needed */}
          </select>
        </div>

        {/* List */}
        {sharedSections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No shared sections yet</p>
            <p className="text-gray-400 mt-2">Create your first shared section to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedSections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {section.name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {getSectionTypeLabel(section.type)}
                      </span>
                      {section._count.sections > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Used on {section._count.sections} page{section._count.sections !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-gray-600 mb-3">{section.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(section.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/admin/shared-sections/${section.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(section.id, section._count.sections)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                      disabled={section._count.sections > 0}
                    >
                      <TrashIcon className="w-5 h-5" />
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
