"use client";

import Image from 'next/image';
import { useState } from 'react';
import { getAssetUrl, isAssetPath } from '@/lib/assets';

interface ManagedImageProps {
  src: string;          // S3 path: "images/hero/construction.jpg" or full URL
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  onError?: () => void;
}

export function ManagedImage({ 
  src, 
  alt, 
  quality = 85,
  onError,
  ...props 
}: ManagedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Convert S3 path to full URL using our utility
  const imageUrl = isAssetPath(src) ? getAssetUrl(src) : src;

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback image if error occurs
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${props.className || ''}`}>
        <span className="text-gray-500 text-sm">Image not found</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imageUrl}
      alt={alt}
      quality={quality}
      onError={handleError}
    />
  );
}
