import Link from 'next/link';

interface RelatedProduct {
  code: string;
  name: string | null;
  filterType: { name: string } | null;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Related Products
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <Link
              key={product.code}
              href={`/products/${product.code}`}
              className="group bg-white rounded-lg border border-gray-200 hover:border-sure-blue-300 hover:shadow-md transition-all p-4 text-center"
            >
              <div className="mb-2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-sure-blue-50 group-hover:bg-sure-blue-100 transition-colors">
                <svg className="w-6 h-6 text-sure-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-sure-blue-600 transition-colors mb-1">
                {product.code}
              </h3>
              {product.filterType && (
                <p className="text-xs text-gray-500">
                  {product.filterType.name}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
