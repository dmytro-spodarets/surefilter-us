'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ResourceForm from '@/components/admin/ResourceForm';
import Link from 'next/link';

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [resourceData, setResourceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await fetch(`/api/admin/resources/${id}`);
      if (!response.ok) throw new Error('Failed to fetch resource');

      const data = await response.json();
      setResourceData(data);
    } catch (error) {
      console.error('Error fetching resource:', error);
      alert('Failed to load resource');
      router.push('/admin/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update resource');
      }

      alert('Resource updated successfully!');
      fetchResource(); // Reload data
    } catch (error: any) {
      console.error('Error updating resource:', error);
      alert(error.message);
      throw error;
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure? Unsaved changes will be lost.')) {
      router.push('/admin/resources');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!resourceData) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Resource not found</p>
          <Link href="/admin/resources" className="text-sure-blue-600 hover:text-sure-blue-700 mt-2 inline-block">
            Back to resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
          <p className="text-gray-600 mt-1">Update resource information</p>
        </div>
        <Link
          href={`/resources/${resourceData.slug}`}
          target="_blank"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View Public Page →
        </Link>
      </div>

      <ResourceForm 
        initialData={{
          ...resourceData,
          categoryId: resourceData.category?.id || '',
          formId: resourceData.form?.id || '',
        }} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  );
}

