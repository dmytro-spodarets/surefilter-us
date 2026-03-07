export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 mt-24 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-96 mb-8"></div>

        {/* Filters bar */}
        <div className="flex gap-4 mb-8">
          <div className="h-10 bg-white rounded-lg border border-gray-200 w-48"></div>
          <div className="h-10 bg-white rounded-lg border border-gray-200 w-48"></div>
          <div className="h-10 bg-white rounded-lg border border-gray-200 w-64"></div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
