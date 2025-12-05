"use client";

import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import Link from 'next/link';
import { DocumentTextIcon, PlayIcon, BookOpenIcon, AcademicCapIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { getAssetUrl } from '@/lib/assets';

// Icon mapping for categories
const iconMap: Record<string, any> = {
  DocumentTextIcon,
  PlayIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
};

// Fallback images if no thumbnail
function getGalleryImageByIndex(index: number) {
  const images = ['/images/image.jpg', '/images/image-2.jpg', '/images/image-3.jpg', '/images/image-4.jpg'];
  return images[index % images.length];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  _count: {
    resources: number;
  };
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnailImage?: string;
  fileType: string;
  fileSize?: string;
  fileMeta?: string;
  publishedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
}

interface ResourcesClientProps {
  initialResources: Resource[];
  initialCategories: Category[];
}

export default function ResourcesClient({ initialResources, initialCategories }: ResourcesClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [categories] = useState<Category[]>(initialCategories);
  const [allResources] = useState<Resource[]>(initialResources);

  // Filter resources based on active filter
  const filteredResources = activeFilter === 'all' 
    ? allResources 
    : allResources.filter(r => r.category.slug === activeFilter);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 md:mb-8">
          {/* All Resources button */}
          <button
            onClick={() => setActiveFilter('all')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'all'
                ? 'border-sure-blue-500 bg-sure-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-2 ${
                activeFilter === 'all' 
                  ? 'bg-sure-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <span className={`text-sm font-medium ${
                activeFilter === 'all' ? 'text-sure-blue-700' : 'text-gray-700'
              }`}>
                All Resources
              </span>
            </div>
          </button>

          {/* Dynamic categories from CMS */}
          {categories.map((category) => {
            const IconComponent = category.icon && iconMap[category.icon] ? iconMap[category.icon] : DocumentTextIcon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.slug)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  activeFilter === category.slug
                    ? 'border-sure-blue-500 bg-sure-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-2 ${
                    activeFilter === category.slug 
                      ? 'bg-sure-blue-500 text-white' 
                      : category.color || 'bg-gray-100 text-gray-700'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    activeFilter === category.slug ? 'text-sure-blue-700' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="text-sm text-gray-500">
            {filteredResources.length} items • View:
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('gallery')}
              aria-pressed={viewMode === 'gallery'}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'gallery' ? 'bg-sure-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon name="Squares2X2Icon" className="w-4 h-4" />
              Gallery
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-l border-gray-200 ${
                viewMode === 'list' ? 'bg-sure-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon name="Bars3Icon" className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Resources View */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No resources found</p>
            <p className="text-gray-500 text-sm mt-2">Try selecting a different category</p>
          </div>
        ) : viewMode === 'gallery' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredResources.map((resource, idx) => {
                const imageUrl = resource.thumbnailImage 
                  ? getAssetUrl(resource.thumbnailImage)
                  : getGalleryImageByIndex(idx);
                
                return (
                  <Link
                    key={resource.id}
                    href={`/resources/${resource.slug}`}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image 
                        src={imageUrl} 
                        alt={resource.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                        {resource.category.name}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-sure-blue-600 transition-colors">{resource.title}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>{resource.fileType}</span>
                        {resource.fileSize && <span>{resource.fileSize}</span>}
                        {resource.fileMeta && <span>{resource.fileMeta}</span>}
                      </div>
                      <div className="mt-3 text-sure-blue-600 group-hover:text-sure-blue-700 text-sm font-medium">
                        Download →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        ) : (
          <div className="space-y-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sure-blue-100 text-sure-blue-800">
                        {resource.category.name}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {resource.fileType}
                      </span>
                      {resource.fileSize && (
                        <span className="ml-3 text-sm text-gray-500">
                          {resource.fileSize}
                        </span>
                      )}
                      {resource.fileMeta && (
                        <span className="ml-3 text-sm text-gray-500">
                          {resource.fileMeta}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {resource.shortDescription || ''}
                    </p>
                  </div>
                  <a 
                    href={`/resources/${resource.slug}`} 
                    className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors ml-4 flex-shrink-0"
                  >
                    Download →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

