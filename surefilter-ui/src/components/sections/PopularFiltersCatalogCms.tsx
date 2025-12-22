import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { prisma } from '@/lib/prisma';

interface PopularFiltersCatalogCmsProps {
  title?: string;
  description?: string;
  catalogHref?: string;
  catalogText?: string;
  className?: string;
  columnsPerRow?: number;
  productIds: string[];
}

export default async function PopularFiltersCatalogCms({ 
  title = 'Popular Filters',
  description = 'Top-selling filters for heavy duty applications',
  catalogHref = '/catalog',
  catalogText = 'Browse All Filters',
  className = '',
  columnsPerRow = 5,
  productIds = []
}: PopularFiltersCatalogCmsProps) {
  
  // Load products from database
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      media: {
        where: { isPrimary: true },
        include: {
          asset: {
            select: {
              cdnUrl: true,
            },
          },
        },
        take: 1,
      },
      categories: {
        where: { isPrimary: true },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        take: 1,
      },
      filterType: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  // Sort products by the order in productIds
  const sortedProducts = productIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  if (sortedProducts.length === 0) {
    return null;
  }

  // Randomly select products based on columnsPerRow
  const shuffled = [...sortedProducts].sort(() => Math.random() - 0.5);
  const displayProducts = shuffled.slice(0, columnsPerRow);

  const getProductImage = (product: any) => {
    return product.media?.[0]?.asset?.cdnUrl || '/images/placeholder-product.jpg';
  };

  const getProductFilterType = (product: any) => {
    return product.filterType?.name || 'Filter';
  };

  // Grid columns logic like original PopularFilters
  const gridCols = columnsPerRow === 5 
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

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
          {displayProducts.map((product: any) => (
            <Link key={product.id} href={catalogHref} className="group">
              <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-sure-blue-200 transition-all duration-200 hover:-translate-y-1">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name || product.code}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-sure-blue-600 transition-colors duration-200">
                  {product.code}
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
