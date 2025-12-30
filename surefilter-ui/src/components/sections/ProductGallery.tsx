"use client";

import { ManagedImage } from '@/components/ui/ManagedImage';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: { src: string; alt?: string }[];
  className?: string;
}

export default function ProductGallery({ images, className = '' }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [errorMap, setErrorMap] = useState<Record<number, boolean>>({});

  const hasThumbnails = images.length > 1;
  const current = images[index];

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
        {errorMap[index] ? (
          <div className="absolute inset-0 bg-gradient-to-br from-sure-blue-600 to-sure-red-500 flex items-center justify-center">
            <span className="text-white/90 text-sm font-medium">Image not available</span>
          </div>
        ) : (
          <ManagedImage
            src={current.src}
            alt={current.alt || 'Product image'}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-contain"
            onError={() => setErrorMap(prev => ({ ...prev, [index]: true }))}
            priority
            showPlaceholder={false}
          />
        )}
      </div>

      {hasThumbnails && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border transition-colors',
                index === i ? 'border-sure-blue-500' : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
            >
              <ManagedImage
                src={img.src}
                alt={img.alt || `Thumbnail ${i + 1}`}
                fill
                sizes="(max-width: 768px) 20vw, 120px"
                className="object-cover"
                showPlaceholder={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
