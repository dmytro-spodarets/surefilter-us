export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[30vh] min-h-[250px] max-h-[350px] bg-gray-300 mt-24"></div>

      {/* Articles grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-[16/9] bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-100 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
