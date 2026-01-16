"use client";

import Icon from '@/components/ui/Icon';
import { ManagedImage } from '@/components/ui/ManagedImage';
import Link from 'next/link';
import { DocumentTextIcon, PlayIcon, BookOpenIcon, AcademicCapIcon, WrenchScrewdriverIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAssetUrl } from '@/lib/assets';
import ResourcePreviewModal from '@/components/ResourcePreviewModal';

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
  file: string;
  fileType: string;
  fileSize?: string;
  fileMeta?: string;
  allowDirectDownload: boolean;
  allowPreview: boolean;
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
  initialCategory?: string; // Pre-selected category from URL route
}

export default function ResourcesClient({ initialResources, initialCategories, initialCategory }: ResourcesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  
  const [activeFilter, setActiveFilter] = useState(initialCategory || 'all');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [categories] = useState<Category[]>(initialCategories);
  const [allResources] = useState<Resource[]>(initialResources);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Set initial filter from URL parameter
  useEffect(() => {
    if (categoryParam) {
      // Check if category exists
      const categoryExists = initialCategories.some(cat => cat.slug === categoryParam);
      if (categoryExists) {
        setActiveFilter(categoryParam);
      }
    }
  }, [categoryParam, initialCategories]);

  // Filter resources based on active filter
  const filteredResources = activeFilter === 'all' 
    ? allResources 
    : allResources.filter(r => r.category.slug === activeFilter);

  // Update URL when filter changes
  const handleFilterChange = (categorySlug: string) => {
    setActiveFilter(categorySlug);
    
    // Update URL - use clean routes
    if (categorySlug === 'all') {
      router.push('/resources');
    } else {
      router.push(`/resources/${categorySlug}`);
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 md:mb-8">
          {/* All Resources button */}
          <button
            onClick={() => handleFilterChange('all')}
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
                onClick={() => handleFilterChange(category.slug)}
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
              {filteredResources.map((resource, index) => {
                const imageUrl = resource.thumbnailImage || getGalleryImageByIndex(index);
                
                const cardContent = (
                  <>
                    <div className="relative aspect-[10/13] bg-gray-100">
                      <ManagedImage 
                        src={imageUrl} 
                        alt={resource.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-sure-blue-600 transition-colors">
                        {resource.title}
                      </h3>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mb-3">
                        <span>{resource.fileType}</span>
                        {resource.fileSize && (
                          <>
                            <span>•</span>
                            <span>{resource.fileSize}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {resource.allowPreview && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPreviewResource(resource);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-sure-blue-600 text-sm font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all duration-200"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Preview
                          </button>
                        )}
                        {resource.allowDirectDownload && (
                          <a
                            href={getAssetUrl(resource.file)}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-sure-blue-600 text-sm font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all duration-200"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download
                          </a>
                        )}
                        {!resource.allowDirectDownload && !resource.allowPreview && (
                          <div className="text-sure-blue-600 group-hover:text-sure-blue-700 text-sm font-medium">
                            View Details →
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
                
                return resource.allowDirectDownload || resource.allowPreview ? (
                  <div
                    key={resource.id}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all"
                  >
                    {cardContent}
                  </div>
                ) : (
                  <Link
                    key={resource.id}
                    href={`/resources/${resource.category.slug}/${resource.slug}`}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all"
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all">
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
                  
                  {/* Action buttons for list view */}
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {resource.allowPreview && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPreviewResource(resource);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sure-blue-600 font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all duration-200"
                      >
                        <EyeIcon className="w-5 h-5" />
                        Preview
                      </button>
                    )}
                    {resource.allowDirectDownload && (
                      <a 
                        href={getAssetUrl(resource.file)}
                        download
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sure-blue-600 font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all duration-200"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download
                      </a>
                    )}
                    {!resource.allowDirectDownload && !resource.allowPreview && (
                      <a 
                        href={`/resources/${resource.category.slug}/${resource.slug}`} 
                        className="text-sure-blue-600 font-semibold hover:text-sure-blue-700 transition-colors"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          fileUrl={getAssetUrl(previewResource.file)}
          fileName={previewResource.title}
          fileType={previewResource.fileType}
          mimeType={previewResource.file.includes('.pdf') ? 'application/pdf' : previewResource.file.includes('.mp4') ? 'video/mp4' : undefined}
        />
      )}
    </section>
  );
}

