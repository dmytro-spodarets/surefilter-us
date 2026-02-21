'use client';

import React from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';

interface CompactHeroProps {
  title: string;
  description?: string;
  backgroundImage: string;
  className?: string;
}

const CompactHero: React.FC<CompactHeroProps> = ({
  title,
  description,
  backgroundImage,
  className,
}) => {
  return (
    <section className={cn(
      'relative h-[30vh] min-h-[250px] max-h-[350px] flex items-center justify-center mt-24 overflow-hidden',
      className
    )}>
      {/* Фоновая картинка */}
      <div className="absolute inset-0 z-0">
        <ManagedImage
          src={backgroundImage}
          alt="Hero Background"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
        />
        {/* Темный оверлей для читаемости текста */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Контент по центру */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Заголовок - уменьшенный */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2 drop-shadow-lg">
          {title}
        </h1>
        
        {/* Описание - уменьшенное */}
        {description && (
          <p className="text-sm sm:text-base lg:text-lg text-gray-100 leading-relaxed drop-shadow-md">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default CompactHero;
