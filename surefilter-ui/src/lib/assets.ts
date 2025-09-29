/**
 * Asset management utilities for S3-based file storage
 * Best practices for September 2025
 */

const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.surefilter.us';

/**
 * Convert S3 path to full CDN URL
 * @param s3Path - Relative path like "images/hero/construction.jpg"
 * @returns Full CDN URL
 */
export function getAssetUrl(s3Path: string): string {
  // Remove leading slash if present
  const cleanPath = s3Path.startsWith('/') ? s3Path.slice(1) : s3Path;
  return `${CDN_BASE_URL}/${cleanPath}`;
}

/**
 * Get optimized image URL for Next.js Image component
 * @param s3Path - Relative path like "images/hero/construction.jpg"
 * @param width - Optional width for optimization
 * @param quality - Optional quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  s3Path: string, 
  width?: number, 
  quality: number = 85
): string {
  const fullUrl = getAssetUrl(s3Path);
  
  // For external URLs, Next.js Image will handle optimization
  return fullUrl;
}

/**
 * Check if path is an S3 asset path
 * @param path - Path to check
 * @returns True if it's an S3 asset path
 */
export function isAssetPath(path: string): boolean {
  // Remove leading slash for checking
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath.startsWith('images/') || 
         cleanPath.startsWith('videos/') || 
         cleanPath.startsWith('documents/');
}

/**
 * Extract file extension from S3 path
 * @param s3Path - S3 path
 * @returns File extension without dot
 */
export function getFileExtension(s3Path: string): string {
  return s3Path.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 * @param s3Path - S3 path
 * @returns True if it's an image file
 */
export function isImageFile(s3Path: string): boolean {
  const ext = getFileExtension(s3Path);
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
}

/**
 * Get MIME type from S3 path
 * @param s3Path - S3 path
 * @returns MIME type
 */
export function getMimeType(s3Path: string): string {
  const ext = getFileExtension(s3Path);
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
  };
  return mimeMap[ext] || 'application/octet-stream';
}
