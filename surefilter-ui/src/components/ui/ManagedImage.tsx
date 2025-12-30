"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  fallback?: string;    // Fallback image URL
  showPlaceholder?: boolean; // Show placeholder instead of "Image not found"
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
  fallback,
  showPlaceholder = true,
  onError,
  ...props 
}: ManagedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const MAX_RETRIES = 2;

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  // Convert S3 path to full URL using our utility
  const imageUrl = isAssetPath(currentSrc) ? getAssetUrl(currentSrc) : currentSrc;

  const handleError = () => {
    // Try fallback first
    if (fallback && !hasError) {
      setCurrentSrc(fallback);
      setHasError(false);
      return;
    }

    // Retry loading the original image
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Force reload by adding cache-busting parameter
        const separator = imageUrl.includes('?') ? '&' : '?';
        setCurrentSrc(`${src}${separator}retry=${retryCount + 1}`);
      }, 1000 * (retryCount + 1)); // Exponential backoff
      return;
    }

    setHasError(true);
    onError?.();
  };

  // Fallback if src is empty or error occurs after retries
  if (!src || !imageUrl || (hasError && retryCount >= MAX_RETRIES)) {
    if (!showPlaceholder) {
      return null;
    }
    return (
      <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center ${props.className || ''}`}>
        {/* Logo */}
        <div className="w-16 h-16 mb-2 opacity-30 grayscale flex items-center justify-center">
          <img
            src="/images/sf-logo.png"
            alt="Sure Filter"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Text */}
        <span className="text-xs text-gray-400 font-medium">Loading image...</span>
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
