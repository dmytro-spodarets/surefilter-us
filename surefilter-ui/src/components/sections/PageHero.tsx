"use client";

import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  title: string;
  description?: string;
  image1?: string;
  image1Alt?: string;
  image2?: string;
  image2Alt?: string;
  image3?: string;
  image3Alt?: string;
  image4?: string;
  image4Alt?: string;
  className?: string;
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  image1 = '/images/image.jpg',
  image1Alt = 'Filter manufacturing',
  image2 = '/images/image-2.jpg',
  image2Alt = 'Quality control',
  image3 = '/images/image-3.jpg',
  image3Alt = 'Industrial equipment',
  image4 = '/images/image-4.jpg',
  image4Alt = 'Heavy duty machinery',
  className,
}) => {
  // Изображения для сетки 2x2 с offset'ами
  const gridImages = [
    { src: image1, alt: image1Alt, offset: false },
    { src: image2, alt: image2Alt, offset: true },
    { src: image3, alt: image3Alt, offset: false },
    { src: image4, alt: image4Alt, offset: true },
  ];

  return (
    <section className={cn(
      'relative bg-gradient-to-br from-gray-200 to-gray-100 mt-24 pt-8 pb-6 lg:pt-12 lg:pb-6 lg:h-[65vh] lg:min-h-[540px] lg:max-h-[750px] lg:flex lg:items-center',
      className
    )}>
      {/* Background extends behind fixed header */}
      <div className="absolute inset-0 -top-24 bg-gradient-to-br from-gray-200 to-gray-100 -z-10" />
      {/* Основной контейнер */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center w-full max-w-6xl">
          
          {/* Левая часть - контент */}
          <div className="text-center lg:text-left">
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
          
          {/* Правая часть - сетка изображений 2x2 */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4 relative w-full max-w-sm lg:max-w-lg mx-auto lg:mx-0">
            {gridImages.map((img, index) => (
              <div
                key={index}
                className={cn(
                  'relative rounded-lg overflow-hidden shadow-md w-full h-[120px] lg:h-[210px]',
                  img.offset && 'lg:-translate-y-[30px]'
                )}
              >
                <ManagedImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  quality={95}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default PageHero;