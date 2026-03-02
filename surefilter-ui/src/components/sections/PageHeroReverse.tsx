"use client";

import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';

interface PageHeroReverseProps {
  title?: string;
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

const PageHeroReverse: React.FC<PageHeroReverseProps> = ({
  title,
  description,
  image1,
  image1Alt,
  image2,
  image2Alt,
  image3,
  image3Alt,
  image4,
  image4Alt,
  className,
}) => {
  if (!title) return null;
  
  // Изображения для сетки 2x2 с offset'ами
  const gridImages = [
    image1 ? { src: image1, alt: image1Alt || '', offset: true } : null,
    image2 ? { src: image2, alt: image2Alt || '', offset: false } : null,
    image3 ? { src: image3, alt: image3Alt || '', offset: true } : null,
    image4 ? { src: image4, alt: image4Alt || '', offset: false } : null,
  ].filter((img): img is { src: string; alt: string; offset: boolean } => img !== null);

  return (
    <section className={cn(
      'relative bg-gradient-to-br from-gray-200 to-gray-100 mt-24 pt-8 pb-6 lg:pt-12 lg:pb-6 lg:h-[65vh] lg:min-h-[540px] lg:max-h-[750px] lg:flex lg:items-center',
      className
    )}>
      {/* Background extends behind fixed header */}
      <div className="absolute inset-0 -top-24 bg-gradient-to-br from-gray-200 to-gray-100 -z-10" />
      {/* Основной контейнер */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center">
        <div className={cn(
          "w-full gap-6 lg:gap-16 items-center max-w-6xl",
          gridImages.length > 0 ? "grid grid-cols-1 lg:grid-cols-2" : "flex justify-center"
        )}>

          {/* Левая часть - сетка изображений 2x2 */}
          {gridImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 lg:gap-4 relative w-full max-w-sm lg:max-w-lg mx-auto lg:mx-0 order-2 lg:order-1">
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
          )}
          
          {/* Правая часть - контент */}
          <div className={cn(
            "text-center",
            gridImages.length > 0 ? "lg:text-left order-1 lg:order-2" : ""
          )}>
            {/* Заголовок */}
            <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.15] font-bold text-gray-900 leading-tight mb-4 lg:mb-6">
              {title}
            </h1>
            
            {/* Описание */}
            {description && (
              <p className="text-base lg:text-xl text-gray-600 leading-relaxed">
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
