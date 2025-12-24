"use client";

import Link from 'next/link';
import { useRef } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface RelatedFilter {
  name: string;
  href: string;
  image: string;
  description?: string;
}

interface RelatedFiltersProps {
  title?: string;
  description?: string;
  filters: RelatedFilter[];
  className?: string;
}

export default function RelatedFilters({ 
  title = "Other Filter Types", 
  description = "Explore our complete range of heavy duty filtration solutions",
  filters,
  className = ""
}: RelatedFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className={`py-16 sm:py-24 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll buttons - positioned outside container */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 lg:gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-4 lg:px-8"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {filters.map((filter, index) => (
              <Link 
                key={index}
                href={filter.href}
                className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-sure-blue-200 transition-all duration-200 flex-shrink-0 w-[calc(50%-0.5rem)] lg:w-[calc(25%-1.125rem)]"
                style={{ 
                  scrollSnapAlign: 'start'
                }}
              >
                {/* Image - 16:9 aspect ratio */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                  {filter.image ? (
                    <ManagedImage
                      src={filter.image}
                      alt={filter.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Content - centered */}
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sure-blue-600 transition-colors duration-200 mb-2">
                    {filter.name}
                  </h3>
                  {filter.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {filter.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
