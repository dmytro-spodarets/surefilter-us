import { ManagedImage } from '@/components/ui/ManagedImage';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface FeaturedProductsCatalogCmsProps {
  title?: string;
  description?: string;
  fallbackHref?: string;
  productIds?: string[];
}

export default async function FeaturedProductsCatalogCms({ 
  title = 'Featured Products',
  description,
  fallbackHref = '/catalog',
  productIds = []
}: FeaturedProductsCatalogCmsProps) {
  
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

  // Randomly select up to 8 products
  const shuffled = [...sortedProducts].sort(() => Math.random() - 0.5);
  const displayProducts = shuffled.slice(0, 8);

  const getProductImage = (product: any) => {
    return product.media?.[0]?.asset?.cdnUrl || '/images/placeholder-product.jpg';
  };

  const getProductFilterType = (product: any) => {
    return product.filterType?.name || 'Filter';
  };

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
          {displayProducts.map((product: any) => (
            <Link
              key={product.id}
              href={fallbackHref}
              className="block bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-sure-blue-200 transition-all duration-200 group"
            >
              <div className="relative h-40 bg-gray-100">
                <ManagedImage
                  src={getProductImage(product)}
                  alt={product.name || product.code}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Filter Type badge - top right corner */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-block px-3 py-1 bg-sure-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                    {getProductFilterType(product)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sure-blue-600 transition-colors">
                    {product.code}
                  </h3>
                </div>
                
                {product.name && (
                  <p className="text-gray-600 text-sm mb-2">{product.name}</p>
                )}
                
                {product.description && (
                  <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href={fallbackHref} 
            className="inline-block px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200"
          >
            View Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
