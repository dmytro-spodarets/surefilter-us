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

// Shimmer SVG for placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export function ManagedImage({ 
  src, 
  alt, 
  quality = 85,
  priority = false,
  sizes,
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

  // Fallback if src is empty or error occurs
  if (!src || !imageUrl || hasError) {
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
      priority={priority}
      sizes={sizes || "100vw"}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
      onError={handleError}
    />
  );
}
