'use client';

import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { useRef } from 'react';

interface RelatedFilter {
  name: string;
  href: string;
  icon: string;
  description: string;
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
            <Icon name="ChevronLeftIcon" className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            aria-label="Scroll right"
          >
            <Icon name="ChevronRightIcon" className="w-5 h-5 text-gray-600" />
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
                className="group bg-white rounded-lg p-4 lg:p-6 border border-gray-100 hover:border-sure-blue-200 transition-all duration-200 flex-shrink-0 w-[calc(50%-0.5rem)] lg:w-[calc(25%-1.125rem)]"
                style={{ 
                  scrollSnapAlign: 'start'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-sure-blue-50 text-sure-blue-500 rounded-lg flex items-center justify-center group-hover:bg-sure-blue-100 transition-colors duration-200">
                    <Icon name={filter.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900 group-hover:text-sure-blue-600 transition-colors duration-200">
                    {filter.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {filter.description}
                </p>
                <div className="flex items-center text-sure-blue-500 font-medium">
                  Learn more
                  <Icon name="ArrowRightIcon" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
