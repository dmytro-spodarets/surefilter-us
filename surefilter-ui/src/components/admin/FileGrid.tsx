"use client";

import { useState } from 'react';
import { 
  FolderIcon, 
  PhotoIcon, 
  DocumentIcon, 
  VideoCameraIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  ClipboardDocumentIcon,
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

interface FileGridProps {
  files: FileItem[];
  folders: string[];
  loading: boolean;
  currentFolder: string;
  onFolderClick: (folder: string) => void;
  onDeleteFile: (fileId: string, s3Path: string) => void;
  onCopyUrl: (url: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onDeleteFolder?: (folderPath: string) => void;
  onRenameFolder?: (folderPath: string, newName: string) => void;
}

export default function FileGrid({ 
  files, 
  folders, 
  loading, 
  currentFolder,
  onFolderClick, 
  onDeleteFile, 
  onCopyUrl,
  onPreviewFile,
  onDeleteFolder,
  onRenameFolder
}: FileGridProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return PhotoIcon;
    if (mimeType.startsWith('video/')) return VideoCameraIcon;
    if (mimeType === 'application/pdf') return DocumentIcon;
    return DocumentIcon;
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Folders */}
      {folders?.map((folder) => {
        const folderName = folder.split('/').filter(Boolean).pop() || folder;
        return (
          <div
            key={folder}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group relative"
          >
            {/* Folder Dropdown Menu */}
            {(onDeleteFolder || onRenameFolder) && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === `folder-${folder}` ? null : `folder-${folder}`);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
                </button>
                
                {activeDropdown === `folder-${folder}` && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    {onRenameFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newName = prompt('Enter new folder name:', folderName);
                          if (newName && newName.trim() && newName !== folderName) {
                            onRenameFolder(folder, newName.trim());
                          }
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span>Rename</span>
                      </button>
                    )}
                    {onDeleteFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)) {
                            onDeleteFolder(folder);
                          }
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div 
              onClick={() => onFolderClick(currentFolder ? `${currentFolder}/${folder}` : folder)}
              className="cursor-pointer"
            >
              <div className="aspect-square flex items-center justify-center mb-2">
                <FolderIcon className="h-12 w-12 text-blue-500 group-hover:text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate" title={folderName}>
                {folderName}
              </h3>
              <p className="text-xs text-gray-500">Folder</p>
            </div>
          </div>
        );
      })}

      {/* Files */}
      {files?.map((file) => {
        const filename = file.metadata?.filename || file.key.split('/').pop() || file.key;
        const mimeType = file.metadata?.mimeType || 'application/octet-stream';
        const FileIconComponent = getFileIcon(mimeType);

        return (
          <div
            key={file.key}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group relative"
          >
            {/* Dropdown Menu */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === file.key ? null : file.key);
                }}
                className="p-1 rounded-full hover:bg-gray-100 bg-white shadow-sm"
              >
                <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
              </button>
              
              {activeDropdown === file.key && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewFile(file);
                      setActiveDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (file.metadata?.cdnUrl) {
                        onCopyUrl(file.metadata.cdnUrl);
                      }
                      setActiveDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copy URL
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (file.metadata?.id) {
                        onDeleteFile(file.metadata.id, file.key);
                      }
                      setActiveDropdown(null);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* File Preview */}
            <div
              className="aspect-square mb-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative"
              onClick={() => onPreviewFile(file)}
            >
              {isImage(mimeType) && file.metadata?.cdnUrl ? (
                <ManagedImage
                  src={file.metadata.cdnUrl}
                  alt={file.metadata?.altText || filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileIconComponent className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* File Info */}
            <h3 className="text-sm font-medium text-gray-900 truncate" title={filename}>
              {filename}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
            {file.metadata?.width && file.metadata?.height && (
              <p className="text-xs text-gray-400">
                {file.metadata.width} × {file.metadata.height}
              </p>
            )}
          </div>
        );
      })}

      {/* Empty State */}
      {(folders?.length || 0) === 0 && (files?.length || 0) === 0 && !loading && (
        <div className="col-span-full text-center py-12">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">Upload some files to get started</p>
        </div>
      )}
    </div>
  );
}
