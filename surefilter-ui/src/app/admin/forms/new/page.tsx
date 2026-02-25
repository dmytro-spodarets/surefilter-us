'use client';

import { useRouter } from 'next/navigation';
import FormBuilder, { FormData } from '@/components/admin/FormBuilder';

export default function NewFormPage() {
  const router = useRouter();

  const handleSave = async (data: FormData) => {
    try {
      const response = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create form');
      }

      const form = await response.json();
      alert('Form created successfully!');
      router.push(`/admin/forms/${form.id}/edit`);
    } catch (error: any) {
      console.error('Error creating form:', error);
      alert(error.message);
      throw error;
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure? Unsaved changes will be lost.')) {
      router.push('/admin/forms');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Form</h1>
        <p className="text-gray-600 mt-1">Build a custom form to collect data from your users</p>
      </div>

      <FormBuilder onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

