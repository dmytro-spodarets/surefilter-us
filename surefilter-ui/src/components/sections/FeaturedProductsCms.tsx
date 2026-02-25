import { ManagedImage } from '@/components/ui/ManagedImage';
import Link from 'next/link';

interface Item {
  name: string;
  description?: string;
  image?: string;
  category?: string;
  href?: string;
}

export default function FeaturedProductsCms({ title, description, fallbackHref = '/catalog', items = [] as Item[] }: { title?: string; description?: string; fallbackHref?: string; items?: Item[] }) {
  const targetHref = (item: Item) => item.href || fallbackHref;
  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-6 sm:mb-12">
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">{title}</h2>
          )}
          {description && (
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {items.map((product, idx) => (
            <Link
              key={idx}
              href={targetHref(product)}
              className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-sure-blue-200 transition-all duration-200 group"
            >
              <div className="relative aspect-square bg-gray-50 border-b border-gray-100">
                {product.image && (
                  <ManagedImage
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-200"
                  />
                )}

                {/* Category badge - top right corner */}
                {product.category && (
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
                    <span className="inline-block px-1.5 py-0.5 sm:px-3 sm:py-1 bg-sure-blue-600 text-white text-[10px] sm:text-xs font-semibold rounded-full">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2.5 sm:p-4">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-2 group-hover:text-sure-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 text-[11px] sm:text-sm line-clamp-2">{product.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href={fallbackHref} className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200 text-sm sm:text-base">
            View Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}


