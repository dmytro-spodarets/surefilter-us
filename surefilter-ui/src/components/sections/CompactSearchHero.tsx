'use client';

import React, { useState } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';

interface CompactSearchHeroProps {
  title: string;
  description?: string;
  backgroundImage: string;
  className?: string;
}

const CompactSearchHero: React.FC<CompactSearchHeroProps> = ({
  title,
  description,
  backgroundImage,
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

  return (
    <section className={cn(
      'relative h-[50vh] min-h-[400px] max-h-[550px] flex items-center justify-center mt-24 overflow-hidden',
      className
    )}>
      {/* Фоновая картинка */}
      <div className="absolute inset-0 z-0">
        <ManagedImage
          src={backgroundImage}
          alt="Hero Background"
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
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Заголовок - уменьшенный */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2 drop-shadow-lg">
          {title}
        </h1>
        
        {/* Описание - уменьшенное */}
        {description && (
          <p className="text-sm sm:text-base leading-relaxed drop-shadow-md opacity-90 mb-4">
            {description}
          </p>
        )}
        
        {/* Форма поиска - компактная - TODO: Uncomment when catalog is ready */}
        {/* <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by OEM number or part number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-sure-red-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sure-red-500 text-white font-semibold rounded-md hover:bg-sure-red-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Icon name="MagnifyingGlassIcon" size="sm" color="white" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form> */}

        {/* Catalog Link - temporary replacement for search */}
        <div className="max-w-xl mx-auto text-center">
          <a
            href="/catalog"
            className="inline-flex items-center px-6 py-3 bg-sure-red-500 text-white font-semibold rounded-md hover:bg-sure-red-700 transition-colors duration-200 text-sm"
          >
            <Icon name="MagnifyingGlassIcon" size="sm" color="white" className="mr-2" />
            Browse Full Catalog
          </a>
        </div>
      </div>
    </section>
  );
};

export default CompactSearchHero;
