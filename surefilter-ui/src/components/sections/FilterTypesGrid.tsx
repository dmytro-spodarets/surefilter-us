import Link from 'next/link';
import Icon from '@/components/ui/Icon';

interface FilterType {
  name: string;
  icon: string;
  href: string;
}

interface FilterTypesGridProps {
  title?: string;
  description?: string;
  filterTypes: FilterType[];
  className?: string;
}

export default function FilterTypesGrid({ 
  title = "Filter Types", 
  description = "Choose the right filter type for your equipment",
  filterTypes,
  className = ""
}: FilterTypesGridProps) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {filterTypes.map((filter, index) => (
            <Link
              key={index}
              href={filter.href}
              className="group flex flex-col items-center p-6 rounded-2xl border border-gray-100 hover:border-sure-blue-200 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-12 h-12 mb-4 text-sure-blue-500 group-hover:text-sure-blue-600 transition-colors">
                <Icon name={filter.icon} className="w-full h-full" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-sure-blue-600 transition-colors">
                {filter.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
