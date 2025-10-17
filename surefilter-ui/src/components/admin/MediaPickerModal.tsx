'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface MediaFile {
  key: string;
  metadata?: {
    cdnUrl: string;
    filename: string;
    mimeType: string;
  } | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/files/list?folder=${currentFolder}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (file: MediaFile) => {
    if (file.metadata?.cdnUrl) {
      onSelect(file.metadata.cdnUrl);
      onClose();
    }
  };

  const isImage = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    const filename = file.metadata?.filename || file.key;
    return filename.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

        {/* Search */}
        <div className="p-6 border-b">
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
              <div className="text-gray-500">Loading files...</div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">No files found</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => {
                const mimeType = file.metadata?.mimeType || '';
                const filename = file.metadata?.filename || file.key.split('/').pop() || file.key;
                const cdnUrl = file.metadata?.cdnUrl;

                if (!isImage(mimeType)) return null;

                return (
                  <button
                    key={file.key}
                    onClick={() => handleSelect(file)}
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
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
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

