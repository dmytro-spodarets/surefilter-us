'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, FolderIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface MediaFile {
  key: string;
  metadata?: {
    id?: string;
    cdnUrl: string;
    filename: string;
    mimeType: string;
  } | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, assetId?: string) => void;
}

export default function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFiles(true);
    }
  }, [isOpen, currentFolder]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchFiles();
      } else {
        loadFiles(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadFiles = async (reset = false, token?: string) => {
    if (reset) {
      setLoading(true);
      setFiles([]);
      setFolders([]);
      setNextToken(undefined);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const prefix = currentFolder ? `${currentFolder}/` : '';
      const params = new URLSearchParams({
        prefix,
        maxKeys: '50',
      });
      
      if (token) {
        params.append('continuationToken', token);
      }
      
      const res = await fetch(`/api/admin/files/list?${params}`);
      const data = await res.json();
      
      if (reset) {
        setFiles(data.files || []);
        setFolders(data.folders || []);
      } else {
        setFiles(prev => [...prev, ...(data.files || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setNextToken(data.nextToken);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const searchFiles = async () => {
    setIsSearching(true);
    setLoading(true);
    try {
      const prefix = currentFolder ? `${currentFolder}/` : '';
      const params = new URLSearchParams({
        prefix,
        maxKeys: '200', // Больше для поиска
        search: searchQuery,
      });
      
      const res = await fetch(`/api/admin/files/list?${params}`);
      const data = await res.json();
      
      setFiles(data.files || []);
      setFolders([]); // Скрываем папки при поиске
      setHasMore(false); // Отключаем пагинацию при поиске
    } catch (error) {
      console.error('Failed to search files:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const loadMoreFiles = () => {
    if (nextToken && !loadingMore) {
      loadFiles(false, nextToken);
    }
  };

  const navigateToFolder = (folder: string) => {
    // folder уже содержит полный путь от API
    setCurrentFolder(folder);
    setSearchQuery('');
  };

  const navigateUp = () => {
    const parts = currentFolder.split('/').filter(Boolean);
    parts.pop();
    setCurrentFolder(parts.join('/'));
    setSearchQuery('');
  };

  const handleSelect = (file: MediaFile) => {
    if (file.metadata?.cdnUrl) {
      onSelect(file.metadata.cdnUrl, file.metadata.id);
      onClose();
    }
  };

  const isImage = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  // Фильтрация теперь происходит на сервере через API
  const filteredFiles = files;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Select Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Breadcrumbs & Search */}
        <div className="p-6 border-b space-y-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCurrentFolder('');
              }}
              className="text-sure-blue-600 hover:underline"
            >
              Root
            </button>
            {currentFolder && currentFolder.split('/').filter(Boolean).map((part, index, arr) => (
              <span key={index} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const path = arr.slice(0, index + 1).join('/');
                    setCurrentFolder(path);
                  }}
                  className="text-sure-blue-600 hover:underline"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
                <div className="text-gray-500">{isSearching ? 'Searching...' : 'Loading files...'}</div>
              </div>
            </div>
          ) : folders.length === 0 && filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">
                {searchQuery ? 'No files found matching your search' : 'No files found'}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Folders */}
              {!searchQuery && folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToFolder(folder);
                  }}
                  className="group relative aspect-square bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-sure-blue-500 transition-all flex flex-col items-center justify-center border-2 border-dashed border-gray-300"
                >
                  <FolderIcon className="w-12 h-12 text-gray-400 group-hover:text-sure-blue-500 transition-colors" />
                  <p className="mt-2 text-sm text-gray-600 px-2 text-center truncate w-full">
                    {folder.split('/').pop()}
                  </p>
                </button>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => {
                const mimeType = file.metadata?.mimeType || '';
                const filename = file.metadata?.filename || file.key.split('/').pop() || file.key;
                const cdnUrl = file.metadata?.cdnUrl;

                if (!isImage(mimeType)) return null;

                return (
                  <button
                    key={file.key}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(file);
                    }}
                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-sure-blue-500 transition-all"
                  >
                    {cdnUrl && (
                      <img
                        src={cdnUrl}
                        alt={filename}
                        className="w-full h-full object-contain p-2"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{filename}</p>
                    </div>
                  </button>
                );
              })}
              </div>

              {/* Load More Button */}
              {hasMore && !searchQuery && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMoreFiles}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-sure-blue-600 text-white rounded-lg hover:bg-sure-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

