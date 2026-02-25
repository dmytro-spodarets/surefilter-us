'use client';

import { useRouter } from 'next/navigation';
import ResourceForm from '@/components/admin/ResourceForm';

export default function NewResourcePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create resource');
      }

    const resource = await response.json();
    alert('Resource created successfully!');
    router.push('/admin/resources');
    } catch (error: any) {
      console.error('Error creating resource:', error);
      alert(error.message);
      throw error;
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure? Unsaved changes will be lost.')) {
      router.push('/admin/resources');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Resource</h1>
        <p className="text-gray-600 mt-1">Add a new downloadable resource</p>
      </div>

      <ResourceForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

