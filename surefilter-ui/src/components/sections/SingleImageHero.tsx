import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SingleImageHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  className?: string;
}

const SingleImageHero: React.FC<SingleImageHeroProps> = ({
  title,
  description,
  image,
  imageAlt = 'Hero image',
  className,
}) => {
  return (
    <section className={cn(
      'relative h-[60vh] min-h-[400px] lg:min-h-[500px] max-h-[600px] lg:max-h-[700px] bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center mt-24',
      className
    )}>      
      {/* Основной контейнер */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
          
          {/* Левая часть - контент */}
          <div className="text-center lg:text-left">
            {/* Заголовок */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6">
              {title}
            </h1>
            
            {/* Описание */}
            {description && (
              <p className="text-base lg:text-xl text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          {/* Правая часть - одна большая картинка */}
          <div className="relative w-full flex justify-center lg:justify-end">
            <div className="aspect-[3/4] w-full max-w-sm lg:max-w-md max-h-[350px] lg:max-h-[450px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
            
            {/* Декоративные элементы */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-sure-blue-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sure-red-500/10 rounded-full blur-2xl" />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default SingleImageHero;
