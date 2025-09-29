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
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          )}
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {items.map((product, idx) => (
            <Link
              href={targetHref(product)}
              className="block bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-sure-blue-200 transition-all duration-200 group"
            >
              <div className="relative h-40 bg-gray-100">
                {product.image && (
                  <ManagedImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                )}
              </div>
              <div className="p-4">
                {product.category && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-sure-blue-100 text-sure-blue-600 text-xs font-medium rounded-full">
                      {product.category}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-sure-blue-600 transition-colors">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href={fallbackHref} className="inline-block px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200">
            View Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}


