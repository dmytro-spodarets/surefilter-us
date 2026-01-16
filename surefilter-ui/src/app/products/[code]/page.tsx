import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';
import { fetchAndParseCatalog, type CatalogData } from '@/lib/catalog-parser';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ code: string }>;
}

// Revalidate every 24 hours
export const revalidate = 86400;

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  
  const product = await prisma.product.findUnique({
    where: { code: code.toUpperCase() },
    include: { brand: true },
  });

  if (!product) {
    return {
      title: 'Product Not Found | Sure Filter',
    };
  }

  let title = `${product.code} - Sure Filter`;
  let description = `View specifications and applications for Sure Filter ${product.code}`;
  let imageUrl = undefined;

  // Try to get catalog data for better metadata
  if (product.manufacturerCatalogUrl) {
    try {
      const catalogData = await fetchAndParseCatalog(product.manufacturerCatalogUrl);
      if (catalogData.title) {
        title = `${catalogData.title} | Sure Filter`;
      }
      if (catalogData.imageUrl) {
        imageUrl = catalogData.imageUrl;
      }
    } catch (error) {
      // Fallback to basic metadata if catalog fetch fails
      console.error('Error fetching catalog for metadata:', error);
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { code } = await params;
  
  // Fetch product from database
  const product = await prisma.product.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      brand: true,
      filterType: true,
      categories: {
        include: {
          category: true,
        },
        where: {
          isPrimary: true,
        },
        take: 1,
      },
    },
  });

  if (!product) {
    notFound();
  }

  // If no manufacturer catalog URL, show coming soon page
  if (!product.manufacturerCatalogUrl) {
    return (
      <main>
        <Header />
        
        <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-sure-blue-100">
                <svg className="w-10 h-10 text-sure-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.code}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {product.brand.name} Product
              </p>
              
              {/* Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Product Information Coming Soon
                </h2>
                <p className="text-blue-700">
                  Detailed specifications and applications for this product are being prepared.
                </p>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">
                  For immediate information about this product:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center justify-center px-6 py-3 bg-sure-blue-600 text-white font-medium rounded-lg hover:bg-sure-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </Link>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-sure-blue-600 hover:text-sure-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Browse Catalog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    );
  }

  // Fetch and parse manufacturer catalog
  let catalogData: CatalogData | null = null;
  let catalogError: string | null = null;

  try {
    catalogData = await fetchAndParseCatalog(product.manufacturerCatalogUrl);
  } catch (error) {
    catalogError = error instanceof Error ? error.message : 'Failed to load product information';
    console.error('Error fetching catalog:', error);
  }

  // Show error page if catalog fetch failed
  if (catalogError || !catalogData) {
    return (
      <main>
        <Header />
        
        <section className="min-h-screen bg-gray-50 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              {/* Error Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Unable to Load Product Information
              </h1>
              <p className="text-gray-600 mb-8">
                {catalogError || 'We are experiencing technical difficulties loading this product\'s information.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center px-6 py-3 bg-sure-blue-600 text-white font-medium rounded-lg hover:bg-sure-blue-700 transition-colors"
                >
                  Contact Us for Details
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
                >
                  Back to Catalog
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    );
  }

  // Main product page with catalog data
  const primaryCategory = product.categories[0]?.category;

  return (
    <>
      <Header />
      
      {/* Breadcrumbs - minimal */}
      <div className="bg-white border-b border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/catalog" className="hover:text-gray-700">Catalog</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{product.code}</span>
          </nav>
        </div>
      </div>

      {/* Product Header with subtle background */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            {/* Product Image */}
            {catalogData.imageUrl && (
              <div className="lg:col-span-1">
                <div className="relative w-full aspect-square bg-white rounded-xl p-8 border border-gray-200">
                  <Image
                    src={catalogData.imageUrl}
                    alt={catalogData.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            )}
            
            {/* Product Info */}
            <div className={`${catalogData.imageUrl ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {/* Show Filter Type instead of duplicate code */}
              {product.filterType && (
                <div className="inline-block px-3 py-1 bg-sure-blue-50 text-sure-blue-700 text-sm font-medium rounded-full mb-4">
                  {product.filterType.name}
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {catalogData.title}
              </h1>
              
              {/* CTA Button */}
              <Link
                href="/contact-us"
                className="inline-flex items-center px-6 py-3 bg-sure-blue-600 text-white font-semibold rounded-lg hover:bg-sure-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      {catalogData.specifications && catalogData.specifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalogData.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{spec.label}</span>
                  <span className="text-sm text-gray-900 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Primary Applications */}
      {catalogData.primaryApplications && catalogData.primaryApplications.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Primary Applications
            </h2>
            
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Manufacturer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {catalogData.primaryApplications.map((app, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 font-medium">
                        {app.referenceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {app.manufacturer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Applications */}
      {catalogData.applications && catalogData.applications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Applications
            </h2>
            
            <div className="bg-white rounded-lg overflow-x-auto border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Manufacturer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Engine Series
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      CC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fuel
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {catalogData.applications.map((app, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {app.manufacturer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {app.model}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {app.engineSeries}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {app.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {app.cc}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {app.fuel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
