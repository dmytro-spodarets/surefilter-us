import Link from 'next/link';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

interface Filter {
  name: string;
  image: string;
  href: string;
}

interface PopularFiltersProps {
  title?: string;
  description?: string;
  filters: Filter[];
  catalogHref: string;
  catalogText: string;
  className?: string;
  columnsPerRow?: number; // New prop to control columns
}

export default function PopularFilters({ 
  title = "Popular Heavy Duty Filters", 
  description = "Top-selling filters for heavy duty applications",
  filters,
  catalogHref,
  catalogText,
  className = "",
  columnsPerRow = 5
}: PopularFiltersProps) {
  const gridCols = columnsPerRow === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  
  return (
    <section className={`py-16 sm:py-24 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600">
            {description}
          </p>
        </div>

        {/* Filters Grid */}
        <div className={`grid ${gridCols} gap-6 mb-12`}>
          {filters.map((filter, index) => (
            <Link key={index} href={filter.href} className="group">
              <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-sure-blue-200 transition-all duration-200 hover:-translate-y-1">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={filter.image}
                    alt={filter.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-sure-blue-600 transition-colors duration-200">
                  {filter.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Catalog Button */}
        <div className="mt-12 text-center">
          <a
            href={catalogHref}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-sure-blue-500 hover:text-sure-blue-600 transition-all duration-200"
          >
            {catalogText}
            <Icon name="ArrowRightIcon" className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
