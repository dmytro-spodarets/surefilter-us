'use client';

import { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Document, Page, pdfjs } from 'react-pdf';
import Image from 'next/image';

// Configure PDF.js worker from CDN (doesn't increase bundle size)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Import react-pdf styles (correct paths for v9)
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
  mimeType?: string;
}

export default function ResourcePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
  mimeType = 'application/pdf',
}: ResourcePreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPdf = mimeType === 'application/pdf' || fileType === 'PDF';
  const isVideo = mimeType?.startsWith('video/') || fileType === 'Video';
  const isImage = mimeType?.startsWith('image/');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try downloading the file.');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.0, prev + 0.25));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Close on ESC key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white rounded-lg w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-6xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{fileName}</h2>
            <p className="text-sm text-gray-500">{fileType}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom controls for PDF */}
            {isPdf && !loading && !error && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Zoom out"
                >
                  −
                </button>
                <span className="text-sm text-gray-600 font-medium min-w-[50px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 2.0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Zoom in"
                >
                  +
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}
            
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-sure-blue-600 hover:bg-sure-blue-700 rounded-lg transition-colors"
            >
              Download
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {/* PDF Preview */}
          {isPdf && (
            <div className="flex flex-col items-center space-y-4">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sure-blue-600"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                  <div className="text-red-600 font-medium mb-2">Error Loading PDF</div>
                  <p className="text-sm text-red-700 mb-4">{error}</p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Download File Instead
                  </button>
                </div>
              )}
              
              {!error && (
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  className="max-w-full"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                  />
                </Document>
              )}
              
              {/* PDF Navigation */}
              {!loading && !error && numPages > 1 && (
                <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-3 shadow-md">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  <span className="text-sm font-medium text-gray-700">
                    Page {pageNumber} of {numPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Video Preview */}
          {isVideo && (
            <div className="flex items-center justify-center h-full">
              <video
                src={fileUrl}
                controls
                controlsList="nodownload"
                className="max-w-full max-h-full rounded-lg shadow-lg"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Image Preview */}
          {isImage && (
            <div className="flex items-center justify-center h-full">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={fileUrl}
                  alt={fileName}
                  width={1200}
                  height={1600}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Unsupported file type */}
          {!isPdf && !isVideo && !isImage && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 bg-white rounded-lg p-8 max-w-md">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-medium mb-2">Preview not available</p>
                <p className="text-sm mb-6">This file type cannot be previewed in the browser.</p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-sure-blue-600 text-white rounded-lg hover:bg-sure-blue-700 transition-colors"
                >
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
