# Image Loading Best Practices (December 2025)

## Overview
Comprehensive guide for handling images in the SureFilter application with zero "Image not found" errors.

**Status:** ✅ PRODUCTION READY - 16/24 components migrated (all public-facing pages)

**Version:** v0.0.76

## Components

### ManagedImage Component
**Location:** `/src/components/ui/ManagedImage.tsx`

**Features:**
- ✅ Automatic retry with exponential backoff (2 retries)
- ✅ Professional placeholder with Sure Filter logo (grayscale, 30% opacity)
- ✅ S3/CDN path resolution
- ✅ Shimmer placeholder during loading
- ✅ Cache-busting on retry
- ✅ Graceful error handling
- ✅ Custom fallback support

**Usage:**
```tsx
import { ManagedImage } from '@/components/ui/ManagedImage';

// Basic usage with auto-fallback
<ManagedImage
  src="images/products/filter.jpg"
  alt="Air Filter"
  width={800}
  height={600}
/>

// With custom fallback
<ManagedImage
  src="images/products/filter.jpg"
  alt="Air Filter"
  width={800}
  height={600}
  fallback="/images/custom-placeholder.jpg"
/>

// Without placeholder (returns null on error)
<ManagedImage
  src="images/products/filter.jpg"
  alt="Air Filter"
  width={800}
  height={600}
  showPlaceholder={false}
/>
```

## Configuration

### Next.js Image Config
**Location:** `/next.config.ts`

**Optimizations:**
- AVIF and WebP formats
- 30-day cache TTL
- Multiple device sizes (640px - 3840px)
- Regional S3 URLs support
- CloudFront CDN integration

### Asset Utilities
**Location:** `/src/lib/assets.ts`

**Constants:**
- `CDN_BASE_URL`: Auto-detected (MinIO dev / CloudFront prod)

**Functions:**
- `getAssetUrl(path)`: Convert S3 path to full URL
- `isAssetPath(path)`: Check if path is S3 asset
- `getFileExtension(path)`: Extract file extension
- `isImageFile(path)`: Check if file is image

**Note:** Placeholder is now built-in to ManagedImage component (uses `/images/sf-logo.png`)

## Troubleshooting

### Issue: "Image not found" appears
**Solutions:**
1. Check if image exists in S3/MinIO
2. Verify CDN_URL environment variable
3. Check browser console for CORS errors
4. Verify image path format (should be relative: `images/...`)

### Issue: Images load slowly
**Solutions:**
1. Use `priority={true}` for above-the-fold images
2. Specify appropriate `sizes` prop
3. Use WebP/AVIF formats
4. Enable CDN caching

### Issue: Images fail to load in production
**Solutions:**
1. Verify CloudFront distribution is active
2. Check S3 bucket permissions
3. Verify `NEXT_PUBLIC_CDN_URL` environment variable
4. Check Next.js image optimization API

## Migration Guide

### From Next.js Image to ManagedImage

**Before:**
```tsx
<Image
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  onError={() => console.error('Failed')}
/>
```

**After:**
```tsx
<ManagedImage
  src="images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  // Auto-retry and fallback built-in
/>
```

## Performance Tips

1. **Use appropriate sizes:**
   ```tsx
   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
   ```

2. **Prioritize critical images:**
   ```tsx
   priority={true}  // For hero images
   ```

3. **Use fill for responsive containers:**
   ```tsx
   <div className="relative w-full h-64">
     <ManagedImage src="..." alt="..." fill />
   </div>
   ```

4. **Specify quality for different use cases:**
   ```tsx
   quality={90}  // High quality for hero images
   quality={75}  // Standard quality for thumbnails
   ```

## Testing

### Local Development
1. Start MinIO: `cd docker && docker compose up minio`
2. Upload test images to MinIO console (localhost:9001)
3. Test with various image paths

### Production Testing
1. Deploy to staging
2. Test with real S3/CloudFront URLs
3. Verify cache behavior
4. Check error handling with invalid URLs

## Monitoring

### Key Metrics
- Image load time (should be < 2s)
- Error rate (should be < 0.1%)
- Cache hit rate (should be > 90%)
- Retry success rate

### Browser DevTools
1. Network tab: Check image requests
2. Console: Look for error messages
3. Performance tab: Measure load times
4. Application tab: Check cache storage

## Best Practices Summary

✅ **DO:**
- Use `ManagedImage` for all images
- Specify `alt` text for accessibility
- Use appropriate `sizes` for responsive images
- Set `priority` for above-the-fold images
- Use relative paths for S3 assets

❌ **DON'T:**
- Use Next.js `Image` directly without error handling
- Hardcode full URLs (use asset utilities)
- Forget to test error scenarios
- Skip `alt` text
- Use unnecessarily high quality settings

## Architecture Notes

### Catalog Page Structure
The `/catalog` page uses a split architecture for optimal performance:

```
/app/catalog/
  ├── layout.tsx          # Server Component - Header/Footer wrapper
  ├── page.tsx            # Server Component - Main page with CompactHero
  └── CatalogClient.tsx   # Client Component - Interactive filters & state
```

**Why this structure?**
- `layout.tsx` provides Header/Footer for all catalog pages
- `page.tsx` is server-rendered for SEO and initial load
- `CatalogClient.tsx` handles all interactive features (filters, pagination)
- Separates concerns: server-side rendering + client-side interactivity

### Other Pages
Most other pages use the `(site)` route group which has its own layout with Header/Footer.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify image exists in S3/MinIO
3. Review this documentation
4. Check Next.js image optimization docs
5. See `/docs/IMAGE_MIGRATION_CHECKLIST.md` for migration status
