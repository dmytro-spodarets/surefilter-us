import Link from 'next/link';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/assets';

interface FilterType {
  name: string;
  image: string;
  href: string;
}

interface FilterTypesImageGridProps {
  title?: string;
  description?: string;
  columns?: number;
  variant?: 'card' | 'simple';
  items: FilterType[];
  className?: string;
}

// Helper function to generate grid classes based on column count
function getGridClasses(columns: number): string {
  const columnMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    7: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7',
    8: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
  };
  return columnMap[columns] || columnMap[4];
}

export default function FilterTypesImageGrid({ 
  title = "Filter Types", 
  description = "Choose the right filter type for your equipment",
  columns = 4,
  variant = 'card',
  items,
  className = ""
}: FilterTypesImageGridProps) {
  const gridClasses = getGridClasses(columns);
  
  return (
    <section className={`py-12 sm:py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className={`grid ${gridClasses} gap-3 sm:gap-4 justify-items-center`}>
          {items.map((filterType, index) => (
            <Link
              key={index}
              href={filterType.href}
              className="group w-full max-w-xs"
            >
              {variant === 'card' ? (
                // Card variant - with border and background
                <div className="bg-white rounded-2xl border border-gray-200 hover:border-sure-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sure-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Image container with gradient background - full width */}
                  <div className="relative w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 overflow-hidden">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
                      backgroundSize: '24px 24px'
                    }} />
                    
                    {filterType.image ? (
                      <Image
                        src={getAssetUrl(filterType.image)}
                        alt={filterType.name}
                        fill
                        className="object-contain p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 relative z-10"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center relative z-10 shadow-sm">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Label - inside card with padding */}
                  <h3 className="relative text-sm sm:text-base font-bold text-gray-900 text-center group-hover:text-sure-blue-600 transition-colors duration-200 px-3 py-3 sm:py-4 leading-snug">
                    {filterType.name}
                  </h3>
                </div>
              ) : (
                // Simple variant - clean, no borders
                <div className="flex flex-col items-center">
                  {/* Image container - horizontal 16:9 ratio, aligned to bottom */}
                  <div className="relative w-full aspect-[16/9] flex items-end justify-center mb-3">
                    {filterType.image ? (
                      <Image
                        src={getAssetUrl(filterType.image)}
                        alt={filterType.name}
                        fill
                        className="object-contain object-bottom"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Label - below image with underline effect on hover */}
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 text-center transition-all duration-200 leading-tight relative group-hover:text-sure-blue-600">
                    <span className="relative inline-block">
                      {filterType.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sure-blue-600 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </h3>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

