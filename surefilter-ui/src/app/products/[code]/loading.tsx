import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Loading() {
  return (
    <>
      <Header />
      
      {/* Breadcrumbs Skeleton */}
      <div className="bg-white border-b border-gray-100 mt-24 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>

      {/* Product Header Skeleton */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 border-b border-gray-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            {/* Image Placeholder */}
            <div className="lg:col-span-1">
              <div className="relative w-full aspect-square bg-white rounded-xl p-8 border border-gray-200">
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Text Placeholder */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-7 bg-sure-blue-100 rounded-full w-32"></div>
              <div className="h-12 bg-gray-300 rounded w-3/4"></div>
              <div className="h-11 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Skeleton */}
      <section className="py-16 bg-white animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-white rounded-lg border border-gray-200"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Table Skeleton 1 */}
      <section className="py-16 bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-8 bg-gray-200 rounded w-56 mb-8"></div>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="h-11 bg-gray-50 border-b border-gray-200"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 border-b border-gray-200 last:border-b-0"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Table Skeleton 2 */}
      <section className="py-16 bg-white animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="h-11 bg-gray-50 border-b border-gray-200"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 border-b border-gray-200 last:border-b-0"></div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
