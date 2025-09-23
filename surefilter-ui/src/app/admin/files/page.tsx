"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { FolderPlusIcon } from '@heroicons/react/24/outline';
import FileUploader from '@/components/admin/FileUploader';
import FileGrid from '@/components/admin/FileGrid';
import FolderBreadcrumbs from '@/components/admin/FolderBreadcrumbs';
import CreateFolderModal from '@/components/admin/CreateFolderModal';
import FilePreviewModal from '@/components/admin/FilePreviewModal';

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

interface FileListResponse {
  files: FileItem[];
  folders: string[];
  hasMore: boolean;
  nextToken?: string;
}

export default function FilesPage() {
  const { data: session, status } = useSession();
  const [currentFolder, setCurrentFolder] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextToken, setNextToken] = useState<string>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load files for current folder
  const loadFiles = async (folder: string = '', reset: boolean = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        prefix: folder,
        maxKeys: '50',
      });
      
      if (!reset && nextToken) {
        params.append('continuationToken', nextToken);
      }

      const response = await fetch(`/api/admin/files/list?${params}`);
      const data: FileListResponse = await response.json();

      if (reset) {
        setFiles(data.files);
        setFolders(data.folders);
      } else {
        setFiles(prev => [...prev, ...data.files]);
        setFolders(prev => [...new Set([...prev, ...data.folders])]);
      }

      setHasMore(data.hasMore);
      setNextToken(data.nextToken);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load files when folder changes
  useEffect(() => {
    loadFiles(currentFolder);
  }, [currentFolder]);

  // Handle folder navigation
  const navigateToFolder = (folder: string) => {
    setCurrentFolder(folder);
    setFiles([]);
    setFolders([]);
    setNextToken(undefined);
    setHasMore(false);
  };

  // Handle file preview
  const handlePreviewFile = (file: any) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  // Handle file upload success
  const handleUploadSuccess = (uploadedFile: any) => {
    // Refresh the current folder
    loadFiles(currentFolder);
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string, s3Path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/admin/files/delete?id=${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove file from local state
        setFiles(prev => prev.filter(f => f.metadata?.id !== fileId));
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  // Handle folder creation
  const handleCreateFolder = async (folderName: string) => {
    try {
      const response = await fetch('/api/admin/folders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName,
          parentPath: currentFolder
        })
      });

      if (response.ok) {
        // Refresh the current folder
        loadFiles(currentFolder);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folderPath: string) => {
    try {
      // Build full path for deletion
      const fullPath = currentFolder ? `${currentFolder}/${folderPath}` : folderPath;
      
      const response = await fetch(`/api/admin/folders/delete?path=${encodeURIComponent(fullPath)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the current folder
        loadFiles(currentFolder);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert(`Failed to delete folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle folder rename
  const handleRenameFolder = async (folderPath: string, newName: string) => {
    try {
      // Build full path for rename
      const fullPath = currentFolder ? `${currentFolder}/${folderPath}` : folderPath;
      
      const response = await fetch('/api/admin/folders/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: fullPath,
          newName
        })
      });

      if (response.ok) {
        // Refresh the current folder
        loadFiles(currentFolder);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename folder');
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert(`Failed to rename folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Copy CDN URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // You might want to show a toast notification here
  };

  // Redirect if not admin - moved after all hooks
  if (status === 'loading') return <div>Loading...</div>;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
              <p className="mt-2 text-gray-600">
                Upload, organize, and manage your media files
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderPlusIcon className="h-5 w-5" />
              Create Folder
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <FolderBreadcrumbs 
          currentFolder={currentFolder}
          onNavigate={navigateToFolder}
        />

        {/* Upload Area */}
        <div className="mb-8">
          <FileUploader
            currentFolder={currentFolder}
            onUploadSuccess={handleUploadSuccess}
            uploading={uploading}
            setUploading={setUploading}
          />
        </div>

        {/* Files Grid */}
        <FileGrid
          files={files}
          folders={folders}
          loading={loading}
          currentFolder={currentFolder}
          onFolderClick={navigateToFolder}
          onDeleteFile={handleDeleteFile}
          onCopyUrl={copyToClipboard}
          onPreviewFile={handlePreviewFile}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
        />

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => loadFiles(currentFolder, false)}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateModal && (
          <CreateFolderModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateFolder={handleCreateFolder}
            currentPath={currentFolder}
          />
        )}

        {/* File Preview Modal */}
        <FilePreviewModal
          file={previewFile}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onCopyUrl={copyToClipboard}
        />
      </div>
    </div>
  );
}
