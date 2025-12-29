import { ManagedImage } from '@/components/ui/ManagedImage';
import SidebarWidget from './SidebarWidget';

interface ContentWithImagesProps {
  content: string[];
  images?: {
    src: string;
    alt: string;
    position: number; // После какого параграфа вставить изображение
  }[];
  title?: string;
  subtitle?: string;
  sidebarSharedSectionId?: string;
  sidebarData?: any; // Data for sidebar widget (passed from renderer)
  className?: string;
}

export default function ContentWithImages({ 
  content, 
  images = [], 
  title = 'Premium Heavy Duty Oil Filters',
  subtitle = 'Engineered for superior engine protection in the harshest conditions',
  sidebarSharedSectionId,
  sidebarData,
  className = "" 
}: ContentWithImagesProps) {
  const hasSidebar = sidebarSharedSectionId && sidebarData;
  
  return (
    <section className={`py-16 sm:py-24 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className={hasSidebar ? "grid lg:grid-cols-12 gap-8 lg:gap-12" : "max-w-4xl mx-auto"}>
          {/* Main content area */}
          <div className={hasSidebar ? "lg:col-span-8 space-y-8" : "space-y-8"}>
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

          {/* Sidebar with widget */}
          {hasSidebar && sidebarData && (
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <SidebarWidget {...sidebarData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
