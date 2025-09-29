import { ManagedImage } from '@/components/ui/ManagedImage';

interface ContentWithImagesProps {
  content: string[];
  images?: {
    src: string;
    alt: string;
    position: number; // После какого параграфа вставить изображение
  }[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ContentWithImages({ 
  content, 
  images = [], 
  title = 'Premium Heavy Duty Oil Filters',
  subtitle = 'Engineered for superior engine protection in the harshest conditions',
  className = "" 
}: ContentWithImagesProps) {
  return (
    <section className={`py-16 sm:py-24 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main content area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section heading */}
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {content.map((paragraph, index) => (
              <div key={index}>
                {/* All paragraphs use regular styling */}
                <p className="text-gray-600 leading-relaxed text-lg">
                  {paragraph}
                </p>
                
                {/* Insert image after specific paragraphs */}
                {images.find(img => img.position === index + 1) && (
                  <div className="my-12">
                    <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                      <ManagedImage
                        src={images.find(img => img.position === index + 1)!.src}
                        alt={images.find(img => img.position === index + 1)!.alt}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center italic">
                      {images.find(img => img.position === index + 1)!.alt}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar with key highlights */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Key Benefits Card */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3"></div>
                  Key Benefits
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-sure-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">Superior engine protection</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-sure-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">Extended service life</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-sure-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">ISO certified quality</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-sure-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">Global manufacturing standards</span>
                  </li>
                </ul>
              </div>

              {/* Quality Stats */}
              <div className="bg-sure-blue-50 rounded-xl p-6 border border-sure-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3"></div>
                  Quality Assurance
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sure-blue-600">40+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="border-top border-sure-blue-200 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-sure-blue-600">99.9%</div>
                      <div className="text-sm text-gray-600">Filtration Efficiency</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900 mb-2">SURE®</div>
                <div className="text-sm text-gray-600">Trusted Worldwide</div>
                <div className="mt-3 text-xs text-gray-500">ISO 9001:2015 Certified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
