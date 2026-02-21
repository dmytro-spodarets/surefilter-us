'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DynamicForm from '@/components/forms/DynamicForm';
import { CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ResourceDownloadFormProps {
  resource: {
    id: string;
    title: string;
    slug: string;
    file: string;
    fileType: string;
    fileSize: string | null;
    fileMeta: string | null;
    formId: string | null;
  };
}

export default function ResourceDownloadForm({ resource }: ResourceDownloadFormProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const router = useRouter();

  const handleFormSuccess = async (submissionId: string) => {
    try {
      // Generate presigned download URL
      const response = await fetch(`/api/resources/${resource.slug}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate download link');
      }

      const data = await response.json();
      setDownloadUrl(data.downloadUrl);
    } catch (error: any) {
      console.error('Error generating download URL:', error);
      setDownloadError(error.message || 'Failed to generate download link');
    }
  };

  const handleDirectDownload = () => {
    const url = `/api/resources/${resource.slug}/download`;
    window.open(url, '_blank');
  };

  // Success State - Full page
  if (downloadUrl) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center bg-white rounded-lg shadow-lg p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Interest!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Your download is ready. Click the button below to access your file.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-sure-blue-500 text-white font-semibold rounded-lg hover:bg-sure-blue-600 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download {resource.fileType}
              </a>
              <a
                href="/resources"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse More Resources
              </a>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>{resource.fileType}{resource.fileSize && ` • ${resource.fileSize}`}{resource.fileMeta && ` • ${resource.fileMeta}`}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-sure-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowDownTrayIcon className="h-8 w-8 text-sure-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Download Free {resource.fileType}
        </h3>
        <p className="text-gray-600">
          Get instant access to {resource.title}
        </p>
      </div>

      {downloadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{downloadError}</p>
        </div>
      )}

      {resource.formId ? (
        /* Show Form if resource has a form */
        <>
          <DynamicForm
            formId={resource.formId}
            onSuccess={handleFormSuccess}
          />
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By downloading, you agree to receive updates from Sure Filter®
            </p>
          </div>
        </>
      ) : (
        /* Direct Download Button if no form */
        <div className="text-center">
          <button
            onClick={handleDirectDownload}
            className="w-full bg-sure-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sure-blue-600 transition-colors"
          >
            Download Now
          </button>
        </div>
      )}
    </div>
  );
}



