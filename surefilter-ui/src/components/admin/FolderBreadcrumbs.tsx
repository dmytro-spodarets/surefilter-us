"use client";

import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface FolderBreadcrumbsProps {
  currentFolder: string;
  onNavigate: (folder: string) => void;
}

export default function FolderBreadcrumbs({ currentFolder, onNavigate }: FolderBreadcrumbsProps) {
  const pathParts = currentFolder ? currentFolder.split('/').filter(Boolean) : [];

  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      <button
        onClick={() => onNavigate('')}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        Root
      </button>

      {pathParts.map((part, index) => {
        const path = pathParts.slice(0, index + 1).join('/');
        const isLast = index === pathParts.length - 1;

        return (
          <div key={path} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{part}</span>
            ) : (
              <button
                onClick={() => onNavigate(path)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {part}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
