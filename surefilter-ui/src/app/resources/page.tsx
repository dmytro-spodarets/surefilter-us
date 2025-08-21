"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import { DocumentTextIcon, PlayIcon, BookOpenIcon, AcademicCapIcon, WrenchScrewdriverIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const resourceFilters = [
  {
    id: 'all',
    name: 'All Resources',
    icon: DocumentTextIcon,
    color: 'bg-gray-100 text-gray-700'
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: PlayIcon,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'catalogs',
    name: 'Catalogs',
    icon: BookOpenIcon,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: DocumentTextIcon,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'guides',
    name: 'Installation Guides',
    icon: WrenchScrewdriverIcon,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'education',
    name: 'Educational',
    icon: AcademicCapIcon,
    color: 'bg-yellow-100 text-yellow-700'
  }
];

const resources = [
  {
    id: 1,
    title: 'Heavy Duty Filter Catalog 2024',
    description: 'Comprehensive catalog featuring our complete range of heavy duty filtration solutions with specifications and applications.',
    category: 'catalogs',
    type: 'PDF',
    size: '15.2 MB',
    pages: '124 pages',
    downloadUrl: '/resources/heavy-duty-catalog'
  },
  {
    id: 2,
    title: 'Oil Filter Installation Guide',
    description: 'Step-by-step installation procedures for automotive and heavy duty oil filters with best practices.',
    category: 'guides',
    type: 'PDF',
    size: '8.4 MB',
    pages: '32 pages',
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'Filtration Technology Overview',
    description: 'Educational video series covering the fundamentals of filtration technology and Sure Filter innovations.',
    category: 'videos',
    type: 'Video',
    duration: '24 min',
    format: 'MP4',
    downloadUrl: '#'
  },
  {
    id: 4,
    title: 'Automotive Filter Specifications',
    description: 'Technical documentation with detailed specifications for all automotive filter applications.',
    category: 'documents',
    type: 'PDF',
    size: '12.8 MB',
    pages: '89 pages',
    downloadUrl: '#'
  },
  {
    id: 5,
    title: 'Quality Control Procedures',
    description: 'Comprehensive guide to our quality control processes and testing methodologies.',
    category: 'education',
    type: 'PDF',
    size: '6.7 MB',
    pages: '45 pages',
    downloadUrl: '#'
  },
  {
    id: 6,
    title: 'Cross-Reference Guide',
    description: 'Complete cross-reference guide for OEM part numbers and Sure Filter equivalents.',
    category: 'documents',
    type: 'PDF',
    size: '18.9 MB',
    pages: '156 pages',
    downloadUrl: '#'
  },
  {
    id: 7,
    title: 'Industrial Solutions Catalog',
    description: 'Specialized catalog for industrial and commercial filtration applications.',
    category: 'catalogs',
    type: 'PDF',
    size: '11.3 MB',
    pages: '78 pages',
    downloadUrl: '#'
  },
  {
    id: 8,
    title: 'Filter Maintenance Best Practices',
    description: 'Educational material covering proper maintenance techniques to maximize filter life.',
    category: 'education',
    type: 'PDF',
    size: '4.2 MB',
    pages: '28 pages',
    downloadUrl: '#'
  },
  {
    id: 9,
    title: 'Fuel Filter Installation Video',
    description: 'Professional installation demonstration for fuel filters in various vehicle applications.',
    category: 'videos',
    type: 'Video',
    duration: '18 min',
    format: 'MP4',
    downloadUrl: '#'
  },
  {
    id: 10,
    title: 'Air Filter Performance Data',
    description: 'Technical performance data and testing results for our air filtration products.',
    category: 'documents',
    type: 'PDF',
    size: '9.6 MB',
    pages: '67 pages',
    downloadUrl: '#'
  },
  {
    id: 11,
    title: 'Marine Applications Catalog',
    description: 'Comprehensive catalog for marine filtration solutions and applications.',
    category: 'catalogs',
    type: 'PDF',
    size: '10.1 MB',
    pages: '92 pages',
    downloadUrl: '#'
  },
  {
    id: 12,
    title: 'Hydraulic Systems Whitepaper',
    description: 'In-depth technical whitepaper on hydraulic filtration system design and best practices.',
    category: 'documents',
    type: 'PDF',
    size: '7.9 MB',
    pages: '36 pages',
    downloadUrl: '#'
  }
];

function getCategoryName(category: string) {
  const filter = resourceFilters.find(f => f.id === category);
  return filter ? filter.name : category;
}

function getGalleryImageByIndex(index: number) {
  const images = ['/images/image.jpg', '/images/image-2.jpg', '/images/image-3.jpg', '/images/image-4.jpg'];
  return images[index % images.length];
}

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

  const filteredResources = resources.filter(resource => 
    activeFilter === 'all' || resource.category === activeFilter
  );

  return (
    <main>
      <Header />
      
      {/* Compact Hero Section */}
      <CompactHero
        title="Resources"
        description="Access technical documentation, installation guides, product catalogs, and educational materials to help you get the most from your Sure Filter® products."
        backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      />

      {/* Filter Cards Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 md:mb-8">
            {resourceFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  activeFilter === filter.id
                    ? 'border-sure-blue-500 bg-sure-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-2 ${
                    activeFilter === filter.id 
                      ? 'bg-sure-blue-500 text-white' 
                      : filter.color
                  }`}>
                    <filter.icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    activeFilter === filter.id ? 'text-sure-blue-700' : 'text-gray-700'
                  }`}>
                    {filter.name}
                  </span>
                </div>
              </button>
            ))}
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
          {viewMode === 'gallery' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredResources.map((resource, idx) => (
                <div key={resource.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <Image 
                      src={getGalleryImageByIndex(idx)} 
                      alt={resource.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                      {getCategoryName(resource.category)}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{resource.title}</h3>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span>{resource.type}</span>
                      {resource.size && <span>{resource.size}</span>}
                      {resource.pages && <span>{resource.pages}</span>}
                      {resource.duration && <span>{resource.duration}</span>}
                    </div>
                    <div className="mt-3">
                      <a 
                        href={resource.downloadUrl} 
                        className="text-sure-blue-600 hover:text-sure-blue-700 text-sm font-medium"
                      >
                        Download →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sure-blue-100 text-sure-blue-800">
                          {getCategoryName(resource.category)}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {resource.type}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {resource.size || resource.duration}
                        </span>
                        {resource.pages && (
                          <span className="ml-3 text-sm text-gray-500">
                            {resource.pages}
                          </span>
                        )}
                        {resource.format && (
                          <span className="ml-3 text-sm text-gray-500">
                            {resource.format}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                    <a 
                      href={resource.downloadUrl} 
                      className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors ml-4 flex-shrink-0"
                    >
                      Download →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center space-x-2">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200">
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex space-x-1">
              <button className="px-3 py-2 text-sm font-medium text-white bg-sure-blue-500 border border-sure-blue-500 rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                2
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                3
              </button>
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                8
              </button>
            </div>
            
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200">
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}