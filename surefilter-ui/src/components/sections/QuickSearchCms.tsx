'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

export default function QuickSearchCms({
  title = 'Find Your Filter Fast',
  description = 'Enter OEM number or competitor reference to find the right filter',
  placeholder = 'Enter OEM number or competitor reference...',
  ctaLabel = 'Ask our team',
  ctaHref = '#',
}: {
  title?: string;
  description?: string;
  placeholder?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-gray-300">{description}</p>
        </div>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:border-sure-red-500 focus:ring-0 focus:outline-none transition-colors duration-200"
              />
            </div>
            <button type="submit" className="px-8 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer">
              <Icon name="MagnifyingGlassIcon" size="md" color="white" />
              Search
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-300">
            Didn&apos;t find your part?{' '}
            <a href={ctaHref} className="text-sure-blue-400 hover:text-sure-blue-300 hover:underline font-medium transition-colors duration-200">
              {ctaLabel}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}


