"use client";

import Image from 'next/image';
import { getAssetUrl, isAssetPath } from '@/lib/assets';

// Shimmer placeholder SVG for loading state
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

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
  placeholder?: 'shimmer' | 'empty';
}

export function ManagedImage({
  src,
  alt,
  quality = 85,
  priority = false,
  sizes,
  placeholder = 'shimmer',
  fill,
  width,
  height,
  ...props
}: ManagedImageProps) {
  // Convert S3 path to full URL
  const imageUrl = isAssetPath(src) ? getAssetUrl(src) : src;

  // If no src - show nothing
  if (!src || !imageUrl) {
    return null;
  }

  // Generate shimmer placeholder
  const shimmerDataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(width || 700, height || 475))}`;

  return (
    <Image
      {...props}
      src={imageUrl}
      alt={alt}
      quality={quality}
      priority={priority}
      sizes={sizes || "100vw"}
      loading={priority ? "eager" : "lazy"}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      placeholder={placeholder === 'shimmer' ? 'blur' : 'empty'}
      blurDataURL={placeholder === 'shimmer' ? shimmerDataUrl : undefined}
    />
  );
}
