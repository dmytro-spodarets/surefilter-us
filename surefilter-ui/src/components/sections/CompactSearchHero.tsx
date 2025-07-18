'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
      'relative h-[30vh] min-h-[250px] max-h-[350px] flex items-center justify-center mt-24 overflow-hidden',
      className
    )}>
      {/* Фоновая картинка */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        {/* Темный оверлей для читаемости текста */}
        <div className="absolute inset-0 bg-black/60" />
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
        
        {/* Форма поиска - компактная */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
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
        </form>
      </div>
    </section>
  );
};

export default CompactSearchHero;
