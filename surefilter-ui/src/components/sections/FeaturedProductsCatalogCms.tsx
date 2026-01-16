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
    select: {
      id: true,
      code: true,
      description: true,
      manufacturerCatalogUrl: true,
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

  const getProductHref = (product: any) => {
    // If product has manufacturer catalog URL, link to product page
    if (product.manufacturerCatalogUrl) {
      return `/products/${product.code}`;
    }
    // Otherwise fallback to catalog
    return fallbackHref;
  };

  const hasManufacturerUrl = (product: any) => {
    return Boolean(product.manufacturerCatalogUrl);
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
          {displayProducts.map((product: any) => {
            const hasUrl = hasManufacturerUrl(product);
            const CardContent = () => (
              <>
                <div className="relative h-40 bg-gray-100">
                  <ManagedImage
                    src={getProductImage(product)}
                    alt={product.code}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sure-blue-600 transition-colors">
                      {product.code}
                    </h3>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>
                  )}
                </div>
              </>
            );

            return hasUrl ? (
              <Link
                key={product.id}
                href={getProductHref(product)}
                className="block bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-sure-blue-200 transition-all duration-200 group"
              >
                <CardContent />
              </Link>
            ) : (
              <div
                key={product.id}
                className="block bg-white rounded-lg border border-gray-100 overflow-hidden cursor-default group"
              >
                <CardContent />
              </div>
            );
          })}
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
