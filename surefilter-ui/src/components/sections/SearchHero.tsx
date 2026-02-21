"use client";

import React, { useState } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';

interface SearchHeroProps {
  title: string;
  description?: string;
  backgroundImage: string;
  size?: 'standard' | 'compact';
  className?: string;
}

const SearchHero: React.FC<SearchHeroProps> = ({
  title,
  description,
  backgroundImage,
  size = 'standard',
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Здесь можно добавить логику поиска или редирект
      console.log('Searching for:', searchQuery.trim());
      // Например, редирект на страницу поиска:
      // window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Height classes based on size
  const heightClasses = {
    standard: 'h-[70vh] min-h-[450px] lg:min-h-[550px] max-h-[650px] lg:max-h-[750px]',
    compact: 'h-[40vh] min-h-[350px] max-h-[500px]'
  };

  // Text sizes based on size
  const titleClasses = {
    standard: 'text-4xl sm:text-5xl lg:text-6xl',
    compact: 'text-3xl sm:text-4xl lg:text-5xl'
  };

  const descriptionClasses = {
    standard: 'text-lg sm:text-xl lg:text-xl mb-8',
    compact: 'text-base sm:text-lg mb-6'
  };

  return (
    <section className={cn(
      'relative flex items-center justify-center mt-24 overflow-hidden',
      heightClasses[size],
      className
    )}>
      {/* Фоновая картинка */}
      <div className="absolute inset-0 z-0">
        <ManagedImage
          src={backgroundImage}
          alt="Hero background"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
        />
        {/* Темный оверлей для читаемости текста */}
        <div className="absolute inset-0 bg-black/45" />
      </div>
      
      {/* Контент по центру */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Заголовок */}
        <h1 className={cn(
          'font-bold leading-tight mb-4 drop-shadow-lg',
          titleClasses[size]
        )}>
          {title}
        </h1>
        
        {/* Описание */}
        {description && (
          <p className={cn(
            'leading-relaxed drop-shadow-md opacity-90',
            descriptionClasses[size]
          )}>
            {description}
          </p>
        )}
        
        {/* Форма поиска - TODO: Uncomment when catalog is ready */}
        {/* <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by OEM number or part number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-sure-red-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="MagnifyingGlassIcon" size="sm" color="white" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form> */}

        {/* Catalog Link - temporary replacement for search */}
        <div className="max-w-2xl mx-auto text-center">
          <a
            href="/catalog"
            className="inline-flex items-center px-8 py-4 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-700 transition-colors duration-200"
          >
            <Icon name="MagnifyingGlassIcon" size="sm" color="white" className="mr-2" />
            Browse Full Catalog
          </a>
        </div>
      </div>
    </section>
  );
};

export default SearchHero;
