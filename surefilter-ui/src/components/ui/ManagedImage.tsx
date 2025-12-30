"use client";

import Image from 'next/image';
import { getAssetUrl, isAssetPath } from '@/lib/assets';

interface ManagedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
}

export function ManagedImage({ 
  src, 
  alt, 
  quality = 85,
  priority = false,
  sizes,
  ...props 
}: ManagedImageProps) {
  // Convert S3 path to full URL
  const imageUrl = isAssetPath(src) ? getAssetUrl(src) : src;

  // If no src - show nothing
  if (!src || !imageUrl) {
    return null;
  }

  return (
    <Image
      {...props}
      src={imageUrl}
      alt={alt}
      quality={quality}
      priority={priority}
      sizes={sizes || "100vw"}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
