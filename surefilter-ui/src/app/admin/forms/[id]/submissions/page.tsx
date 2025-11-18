'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/admin/Breadcrumbs';

interface Submission {
  id: string;
  data: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  webhookSent: boolean;
  webhookError?: string;
  emailSent: boolean;
  createdAt: string;
}

interface Form {
  id: string;
  name: string;
  slug: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
  }>;
}

export default function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchFormAndSubmissions();
  }, [id]);

  const fetchFormAndSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch form details
      const formResponse = await fetch(`/api/admin/forms/${id}`);
      if (!formResponse.ok) throw new Error('Failed to fetch form');
      const formData = await formResponse.json();
      setForm(formData);

      // Fetch submissions
      const submissionsResponse = await fetch(`/api/admin/form-submissions?formId=${id}`);
      if (!submissionsResponse.ok) throw new Error('Failed to fetch submissions');
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryWebhook = async (submissionId: string) => {
    if (!confirm('Retry sending webhook for this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionId}/retry-webhook`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to retry webhook');

      const result = await response.json();
      
      if (result.success) {
        alert('Webhook sent successfully!');
      } else {
        alert(`Webhook failed: ${result.error || 'Unknown error'}`);
      }

      fetchFormAndSubmissions();
    } catch (error) {
      console.error('Error retrying webhook:', error);
      alert('Failed to retry webhook');
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete submission');

      alert('Submission deleted successfully');
      fetchFormAndSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/form-submissions/export?formId=${id}`);
      if (!response.ok) throw new Error('Failed to export submissions');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form?.slug || 'form'}-submissions-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting submissions:', error);
      alert('Failed to export submissions');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (!form) {
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
      <Breadcrumbs items={[
        { label: 'Admin', href: '/admin' },
        { label: 'Forms', href: '/admin/forms' },
        { label: form.name, href: `/admin/forms/${id}/edit` },
        { label: 'Submissions' },
      ]} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Submissions</h1>
            <p className="text-gray-600 mt-1">{submissions.length} total submissions for "{form.name}"</p>
          </div>
          <div className="flex gap-2">
            {submissions.length > 0 && (
              <button
                onClick={handleExport}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Export CSV
              </button>
            )}
            <Link
              href={`/admin/forms/${id}/edit`}
              className="bg-sure-blue-600 hover:bg-sure-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Form
            </Link>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No submissions yet</p>
          <p className="text-sm text-gray-500 mt-1">Submissions will appear here once users submit this form</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                {form.fields.slice(0, 3).map((field) => (
                  <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                  {form.fields.slice(0, 3).map((field) => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {submission.data[field.id] || '-'}
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {submission.webhookSent ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Webhook ✓
                        </span>
                      ) : submission.webhookError ? (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Webhook ✗
                        </span>
                      ) : null}
                      {submission.emailSent && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Email ✓
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="text-sure-blue-600 hover:text-sure-blue-900 mr-3"
                    >
                      View
                    </button>
                    {submission.webhookError && (
                      <button
                        onClick={() => handleRetryWebhook(submission.id)}
                        className="text-orange-600 hover:text-orange-900 mr-3"
                        title="Retry webhook"
                      >
                        🔄 Retry
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(submission.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Submitted on {new Date(selectedSubmission.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Data */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Form Data</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {form.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {field.label}
                      </label>
                      <div className="text-sm text-gray-900">
                        {selectedSubmission.data[field.id] || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Metadata</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">IP Address:</span>
                    <span className="text-gray-900">{selectedSubmission.ipAddress || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Referer:</span>
                    <span className="text-gray-900 truncate max-w-xs">{selectedSubmission.referer || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Webhook Sent:</span>
                    <span className={selectedSubmission.webhookSent ? 'text-green-600' : 'text-red-600'}>
                      {selectedSubmission.webhookSent ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {selectedSubmission.webhookError && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-500 block mb-1">Webhook Error:</span>
                      <code className="text-xs text-red-600 bg-red-50 p-2 rounded block overflow-x-auto">
                        {selectedSubmission.webhookError}
                      </code>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Sent:</span>
                    <span className={selectedSubmission.emailSent ? 'text-green-600' : 'text-gray-400'}>
                      {selectedSubmission.emailSent ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Agent */}
              {selectedSubmission.userAgent && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">User Agent</h3>
                  <code className="text-xs text-gray-600 bg-gray-50 p-3 rounded block overflow-x-auto">
                    {selectedSubmission.userAgent}
                  </code>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

