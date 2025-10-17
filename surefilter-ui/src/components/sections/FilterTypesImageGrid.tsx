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
  items: FilterType[];
  className?: string;
}

export default function FilterTypesImageGrid({ 
  title = "Filter Types", 
  description = "Choose the right filter type for your equipment",
  items,
  className = ""
}: FilterTypesImageGridProps) {
  return (
    <section className={`py-16 sm:py-24 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {items.map((filterType, index) => (
            <Link
              key={index}
              href={filterType.href}
              className="group"
            >
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
                <h3 className="relative text-xs sm:text-sm font-semibold text-gray-900 text-center group-hover:text-sure-blue-600 transition-colors duration-200 px-3 py-3 sm:py-4">
                  {filterType.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

