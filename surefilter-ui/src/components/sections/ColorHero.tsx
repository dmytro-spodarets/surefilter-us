import React from 'react';
import { cn } from '@/lib/utils';

interface ColorHeroProps {
  title: string;
  description?: string;
  backgroundColor?: string;
  className?: string;
  /** Use 'h2' when the page has its own <h1> in the content area */
  headingLevel?: 'h1' | 'h2';
}

const ColorHero: React.FC<ColorHeroProps> = ({
  title,
  description,
  backgroundColor = '#1e3a5f',
  className,
  headingLevel = 'h1',
}) => {
  const Heading = headingLevel;
  return (
    <section
      className={cn(
        'relative h-[20vh] min-h-[160px] max-h-[230px] flex items-center justify-center mt-24 overflow-hidden',
        className
      )}
      style={{ backgroundColor }}
    >
      {/* Контент по центру */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Heading className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2">
          {title}
        </Heading>

        {description && (
          <p className="text-sm sm:text-base lg:text-lg text-gray-100 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default ColorHero;
