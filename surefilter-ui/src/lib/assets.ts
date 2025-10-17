/**
 * Asset management utilities for S3-based file storage
 * Best practices for September 2025
 */

// Get CDN URL based on environment
function getCdnBaseUrl(): string {
  // In development, use MinIO
  if (process.env.NODE_ENV === 'development') {
    const bucketName = 'surefilter-static';
    return `http://localhost:9000/${bucketName}`;
  }
  
  // In production, use CloudFront CDN
  return process.env.NEXT_PUBLIC_CDN_URL || 'https://new.surefilter.us';
}

const CDN_BASE_URL = getCdnBaseUrl();

/**
 * Convert S3 path to full CDN URL
 * @param s3Path - Relative path like "images/hero/construction.jpg"
 * @returns Full CDN URL
 */
export function getAssetUrl(s3Path: string): string {
  // If it's already a full URL, return as is
  if (s3Path.startsWith('http://') || s3Path.startsWith('https://')) {
    return s3Path;
  }
  
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
  // If it's an external URL, it's not an S3 asset path
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return false;
  }
  
  // Remove leading slash for checking
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path doesn't contain a slash, it's not a valid asset path
  if (!cleanPath.includes('/')) {
    return false;
  }
  
  // Check if it's a media file by extension
  const mediaExtensions = [
    // Images
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico',
    // Videos
    'mp4', 'webm', 'mov', 'avi',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx'
  ];
  const ext = getFileExtension(cleanPath);
  
  // Any folder structure with media files is treated as an asset
  return mediaExtensions.includes(ext);
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
