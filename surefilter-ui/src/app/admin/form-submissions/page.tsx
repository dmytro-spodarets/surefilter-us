'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  data: Record<string, any>;
  webhookSent: boolean;
  webhookError?: string;
  emailSent: boolean;
  createdAt: string;
  form: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Form {
  id: string;
  name: string;
}

export default function AllSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [webhookFilter, setWebhookFilter] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedFormId, webhookFilter]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data.forms || data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedFormId) params.append('formId', selectedFormId);
      if (webhookFilter) params.append('webhookSent', webhookFilter);

      const response = await fetch(`/api/admin/form-submissions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');

      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
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
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFormId) params.append('formId', selectedFormId);

      const response = await fetch(`/api/admin/form-submissions/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export submissions');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-submissions-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting submissions:', error);
      alert('Failed to export submissions');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Form Submissions</h1>
            <p className="text-gray-600 mt-1">View and manage submissions from all forms</p>
          </div>
          {submissions.length > 0 && (
            <button
              onClick={handleExport}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Export CSV
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
          >
            <option value="">All Forms</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>

          <select
            value={webhookFilter}
            onChange={(e) => setWebhookFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
          >
            <option value="">All Webhook Status</option>
            <option value="true">Webhook Sent</option>
            <option value="false">Webhook Failed</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No submissions found</p>
          <p className="text-sm text-gray-500 mt-1">Submissions will appear here once users submit forms</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Preview
                </th>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/forms/${submission.form.id}/edit`}
                      className="text-sm font-medium text-sure-blue-600 hover:text-sure-blue-900"
                    >
                      {submission.form.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md truncate">
                      {Object.entries(submission.data).slice(0, 2).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="text-gray-500">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  </td>
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Submission Details</h2>
                  <p className="text-sm text-gray-500">
                    From "{selectedSubmission.form.name}" • {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Data */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Submitted Data</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {Object.entries(selectedSubmission.data).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {key}
                      </label>
                      <div className="text-sm text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Integration Status</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
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
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <Link
                href={`/admin/forms/${selectedSubmission.form.id}/edit`}
                className="text-sure-blue-600 hover:text-sure-blue-700 font-medium"
              >
                View Form →
              </Link>
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

