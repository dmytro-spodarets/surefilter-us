import React from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { cn } from '@/lib/utils';

interface FullScreenHeroProps {
  title: string;
  description?: string;
  backgroundImage: string;
  className?: string;
}

const FullScreenHero: React.FC<FullScreenHeroProps> = ({
  title,
  description,
  backgroundImage,
  className,
}) => {
  return (
    <section className={cn(
      'relative h-[60vh] min-h-[400px] lg:min-h-[500px] max-h-[600px] lg:max-h-[700px] flex items-center justify-center mt-24 overflow-hidden',
      className
    )}>
      {/* Фоновая картинка */}
      <div className="absolute inset-0 z-0">
        <ManagedImage
          src={backgroundImage}
          alt="Hero background"
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
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Заголовок */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-lg">
          {title}
        </h1>
        
        {/* Описание */}
        {description && (
          <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed drop-shadow-md opacity-90">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default FullScreenHero;
