'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import FormBuilder, { FormData } from '@/components/admin/FormBuilder';
import Link from 'next/link';

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/admin/forms/${id}`);
      if (!response.ok) throw new Error('Failed to fetch form');

      const data = await response.json();
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        type: data.type || 'CONTACT',
        fields: data.fields,
        successTitle: data.successTitle || 'Thank You!',
        successMessage: data.successMessage || 'Your form has been submitted successfully.',
        redirectUrl: data.redirectUrl || '',
        webhookUrl: data.webhookUrl || '',
        webhookHeaders: data.webhookHeaders || {},
        notifyEmail: data.notifyEmail || '',
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Error fetching form:', error);
      alert('Failed to load form');
      router.push('/admin/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      const response = await fetch(`/api/admin/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update form');
      }

      alert('Form updated successfully!');
      fetchForm(); // Reload form data
    } catch (error: any) {
      console.error('Error updating form:', error);
      alert(error.message);
      throw error;
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure? Unsaved changes will be lost.')) {
      router.push('/admin/forms');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Form not found</p>
          <Link href="/admin/forms" className="text-sure-blue-600 hover:text-sure-blue-700 mt-2 inline-block">
            Back to forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Form</h1>
          <p className="text-gray-600 mt-1">Update your form configuration</p>
        </div>
        <Link
          href={`/admin/forms/${id}/submissions`}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View Submissions
        </Link>
      </div>

      <FormBuilder initialData={formData} onSave={handleSave} onCancel={handleCancel} formId={id} />
    </div>
  );
}

