"use client";

import { useState } from 'react';
import { 
  XMarkIcon, 
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface FileItem {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  metadata?: {
    id: string;
    filename: string;
    altText?: string;
    tags: string[];
    width?: number;
    height?: number;
    mimeType: string;
    cdnUrl: string;
  } | null;
}

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
}

export default function FilePreviewModal({ file, isOpen, onClose, onCopyUrl }: FilePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');

  if (!isOpen || !file) return null;

  const filename = file.metadata?.filename || file.key.split('/').pop() || file.key;
  const mimeType = file.metadata?.mimeType || 'application/octet-stream';
  const cdnUrl = file.metadata?.cdnUrl || '';
  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const isPdf = mimeType === 'application/pdf';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyUrl = () => {
    onCopyUrl(cdnUrl);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = cdnUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{filename}</h2>
            <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyUrl}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy CDN URL"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <EyeIcon className="h-4 w-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'preview' && (
            <div className="flex items-center justify-center min-h-[400px]">
              {isImage && (
                <div className="max-w-full max-h-full">
                  <ManagedImage
                    src={cdnUrl}
                    alt={file.metadata?.altText || filename}
                    width={file.metadata?.width || 800}
                    height={file.metadata?.height || 600}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              )}
              
              {isVideo && (
                <video
                  src={cdnUrl}
                  controls
                  className="max-w-full max-h-[60vh] rounded-lg"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {isPdf && (
                <iframe
                  src={`${cdnUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[60vh] border rounded-lg"
                  title={filename}
                />
              )}
              
              {!isImage && !isVideo && !isPdf && (
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📄</div>
                  <p>Preview not available for this file type</p>
                  <p className="text-sm mt-2">Use the download button to view the file</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{filename}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatFileSize(file.size)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MIME Type</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{mimeType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Modified</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(file.lastModified).toLocaleDateString()} {new Date(file.lastModified).toLocaleTimeString()}
                  </p>
                </div>
                {file.metadata?.width && file.metadata?.height && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {file.metadata.width} × {file.metadata.height} px
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">S3 Path</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">{file.key}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CDN URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={cdnUrl}
                    readOnly
                    className="flex-1 text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {file.metadata?.altText && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{file.metadata.altText}</p>
                </div>
              )}

              {file.metadata?.tags && file.metadata.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {file.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
