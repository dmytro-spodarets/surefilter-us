"use client";

import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import imageCompression from 'browser-image-compression';

interface FileUploaderProps {
  currentFolder: string;
  onUploadSuccess: (file: any) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  id: string;
}

export default function FileUploader({ 
  currentFolder, 
  onUploadSuccess, 
  uploading, 
  setUploading 
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Compress image if it's an image file
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // Skip SVG files (they're already optimized)
    if (file.type === 'image/svg+xml') {
      return file;
    }

    try {
      const options = {
        maxSizeMB: 1,          // Max 1MB
        maxWidthOrHeight: 2048, // Max dimension 2048px
        useWebWorker: true,
        fileType: file.type,
      };

      const compressedFile = await imageCompression(file, options);
      
      // Only use compressed if it's smaller
      if (compressedFile.size < file.size) {
        console.log(`Compressed ${file.name}: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
        
        // Preserve original filename - imageCompression loses it
        const renamedFile = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: compressedFile.lastModified,
        });
        
        return renamedFile;
      }
      
      return file;
    } catch (error) {
      console.error('Compression failed, using original:', error);
      return file;
    }
  };

  const handleFiles = async (files: File[]) => {
    setCompressing(true);
    
    // Compress images before creating upload files
    const processedFiles = await Promise.all(
      files.map(async (file) => await compressImageIfNeeded(file))
    );

    setCompressing(false);

    const newUploadFiles: UploadFile[] = processedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    uploadFilesSequentially(newUploadFiles);
  };

  const uploadFilesSequentially = async (filesToUpload: UploadFile[]) => {
    setUploading(true);

    for (const uploadFile of filesToUpload) {
      try {
        setUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
        );

        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('folder', currentFolder || '');

        const response = await fetch('/api/admin/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();

        setUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f)
        );

        onUploadSuccess(result.file);

      } catch (error) {
        setUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f)
        );
      }
    }

    setUploading(false);
    
    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadFiles(prev => prev.filter(f => f.status === 'uploading'));
    }, 3000);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept="image/*,video/*,.pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images, videos, and PDF files (max 50MB each)
            </p>
            <p className="text-xs text-green-600 mt-1">
              ✨ Images are automatically optimized before upload
            </p>
            {currentFolder && (
              <p className="text-xs text-blue-600 mt-1">
                Uploading to: {currentFolder}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compressing indicator */}
      {compressing && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700 font-medium">Optimizing images...</span>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadFiles.map((uploadFile) => (
            <div key={uploadFile.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadFile.status === 'uploading' && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {uploadFile.status === 'success' && (
                    <span className="text-green-600 text-xs font-medium">✓ Uploaded</span>
                  )}
                  
                  {uploadFile.status === 'error' && (
                    <span className="text-red-600 text-xs font-medium">✗ Failed</span>
                  )}
                  
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {uploadFile.error && (
                <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
