"use client";

import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';

interface PageHeroReverseProps {
  title: string;
  description?: string;
  className?: string;
}

const PageHeroReverse: React.FC<PageHeroReverseProps> = ({
  title,
  description,
  className,
}) => {
  // Изображения для сетки 2x2 с offset'ами
  const gridImages = [
    { src: '/images/image.jpg', alt: 'Filter manufacturing', offset: true },
    { src: '/images/image-2.jpg', alt: 'Quality control', offset: false },
    { src: '/images/image-3.jpg', alt: 'Industrial equipment', offset: true },
    { src: '/images/image-4.jpg', alt: 'Heavy duty machinery', offset: false },
  ];

  return (
    <section className={cn(
      'relative h-[60vh] min-h-[400px] lg:min-h-[400px] max-h-[600px] lg:lg:min-h-[500px] max-h-[600px] lg:max-h-[700px] bg-gradient-to-br from-gray-200 to-gray-100 flex items-center mt-24',
      className
    )}>      
      {/* Основной контейнер */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 lg:gap-16 items-center max-w-6xl">
          
          {/* Левая часть - сетка изображений 2x2 */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4 relative max-w-xx lg:max-w-lg h-fit mx-auto lg:mx-0 order-2 lg:order-1">
            {gridImages.map((img, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-lg overflow-hidden shadow-md w-full h-[120px] lg:h-[210px]',
                  img.offset && 'lg:-translate-y-[30px]'
                )}
              >
                <ManagedImage
                  src={img.src}
                  alt={img.alt}
                  width={136}
                  height={210}
                  className="w-full h-full object-cover"
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
          
          {/* Правая часть - контент */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            {/* Заголовок */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-4 lg:mb-6">
              {title}
            </h1>
            
            {/* Описание */}
            {description && (
              <p className="text-basese lg:text-xl text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default PageHeroReverse;
