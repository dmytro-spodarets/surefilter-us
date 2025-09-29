"use client";

import { ManagedImage } from '@/components/ui/ManagedImage';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-white pt-24">
      {/* Диагональное разделение - только для десктопа */}
      <div className="absolute top-24 bottom-0 left-0 right-0 z-0 hidden md:block">
        <div 
          className="absolute inset-0 flex justify-end items-stretch bg-white"
          style={{
            clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 60% 100%)'
          }}
        >
          <div className="flex justify-end items-center h-full">
            <ManagedImage
              src="/images/image-4.jpg"
              alt="Heavy Duty Machinery"
              width={400}
              height={600}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-16 sm:pb-32">
        {/* Мобильная картинка */}
        <div className="md:hidden mb-8">
          <ManagedImage
            src="/images/image-4.jpg"
            alt="Heavy Duty Machinery"
            width={400}
            height={300}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        
        <div className="max-w-xl text-center sm:text-left">
          {/* Бейдж */}
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 rounded-full bg-sure-blue-100 text-sure-blue-600 text-sm font-medium">
            <span className="w-2 h-2 bg-sure-blue-500 rounded-full"></span>
            Wholesale Heavy-Duty Solutions
          </div>
          
          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Filters for<br />
            <span className="text-sure-red-500">Extreme Machines</span>
          </h1>
          
          {/* Описание */}
          <p className="font-sans text-base sm:text-lg text-gray-600 mb-6 sm:mb-4 leading-relaxed">
            Sure Filter® — your guarantee of reliability for the world&apos;s toughest vehicles and equipment.
          </p>
          
          {/* Поиск - TODO: Uncomment when catalog is ready */}
          {/* <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by OEM number or part number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sure-red-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-sm sm:text-base"
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
          
          {/* Ссылка на каталог */}
          <div className="text-center sm:text-left">
            <a href="#products" className="text-sure-blue-600 hover:text-sure-blue-700 hover:underline font-medium transition-colors duration-200">
              Browse our complete catalog →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 