'use client';

import React from 'react';
import Image from 'next/image';
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
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        {/* Темный оверлей для читаемости текста */}
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Контент по центру */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Заголовок - уменьшенный */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2 drop-shadow-lg">
          {title}
        </h1>
        
        {/* Описание - уменьшенное */}
        {description && (
          <p className="text-sm sm:text-base leading-relaxed drop-shadow-md opacity-90">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default CompactHero;
