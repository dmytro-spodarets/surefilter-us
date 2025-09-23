"use client";

import Image from 'next/image';
import { useState } from 'react';

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

  // Determine the full URL based on environment and src format
  const getImageUrl = (src: string): string => {
    // If already a full URL, return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    // For development with MinIO
    if (process.env.NODE_ENV === 'development') {
      return `http://localhost:9000/surefilter-static/${src}`;
    }

    // For production, use CDN
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://new.surefilter.us';
    return `${cdnUrl}/${src}`;
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback for broken images
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${props.className || ''}`}
        style={{ 
          width: props.width, 
          height: props.height,
          ...(props.fill && { position: 'absolute', inset: 0 })
        }}
      >
        Image not found
      </div>
    );
  }

  const imageUrl = getImageUrl(src);

  return (
    <Image
      src={imageUrl}
      alt={alt}
      quality={quality}
      onError={handleError}
      {...props}
    />
  );
}

export default ManagedImage;
