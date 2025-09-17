import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';

interface SimpleSearchProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export default function SimpleSearch({ 
  title = "Find Your Filter", 
  description = "Search by part number or equipment model",
  placeholder = "Enter part number or equipment model...",
  buttonText = "Search",
  className = ""
}: SimpleSearchProps) {
  return (
    <section className={`py-16 sm:py-24 bg-gray-800 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-300">
            {description}
          </p>
        </div>
        {/* Форма поиска - TODO: Uncomment when catalog is ready */}
        {/* <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder={placeholder}
              className="flex-1 w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:border-sure-red-500 focus:ring-0 focus:outline-none transition-colors duration-200"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="MagnifyingGlassIcon" className="w-5 h-5" />
              {buttonText}
            </button>
          </div>
        </div> */}

        {/* Catalog Link - temporary replacement for search */}
        <div className="max-w-2xl mx-auto text-center">
          <a
            href="/catalog"
            className="inline-flex items-center px-8 py-4 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-700 transition-colors duration-200"
          >
            <Icon name="MagnifyingGlassIcon" className="w-5 h-5 mr-2" />
            Browse Full Catalog
          </a>
        </div>
      </div>
    </section>
  );
}
