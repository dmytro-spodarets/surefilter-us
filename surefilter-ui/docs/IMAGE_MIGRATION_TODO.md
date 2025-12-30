# Image Migration TODO

## Priority: HIGH (User-facing components)

### ✅ Completed
- [x] `ManagedImage.tsx` - Created with retry logic
- [x] `FilterTypesImageGrid.tsx` - Migrated to ManagedImage

### 🔴 Critical (Public-facing pages)
- [ ] `PopularFilters.tsx` - Homepage popular filters section
- [ ] `PopularFiltersCatalogCms.tsx` - Catalog page filters
- [ ] `IndustriesCms.tsx` - Industries grid
- [ ] `IndustriesList.tsx` - Industries list page
- [ ] `ContactHero.tsx` - Contact page hero
- [ ] `AwardsCarousel.tsx` - Awards carousel section

### 🟡 Important (Content pages)
- [ ] `QualityAssurance.tsx` - Quality page
- [ ] `WarrantyPromise.tsx` - Warranty page
- [ ] `WarrantyClaimProcess.tsx` - Warranty claim page
- [ ] `LimitedWarrantyDetails.tsx` - Warranty details (partially done)
- [ ] `MagnussonMossAct.tsx` - Warranty act page (partially done)
- [ ] `ManufacturingFacilities.tsx` - Manufacturing page

### 🟢 Low Priority (Admin/Internal)
- [ ] `ProductGallery.tsx` - Product detail gallery (has custom error handling)
- [ ] `ProductForm.tsx` - Admin product form
- [ ] `MediaSection.tsx` - Admin media section
- [ ] `Logo.tsx` - Site logo component

## Migration Strategy

### For each component:

1. **Replace import:**
   ```tsx
   // Before
   import Image from 'next/image';
   
   // After
   import { ManagedImage } from '@/components/ui/ManagedImage';
   ```

2. **Replace component:**
   ```tsx
   // Before
   <Image src={getAssetUrl(path)} alt="..." />
   
   // After
   <ManagedImage src={path} alt="..." />
   // Note: ManagedImage handles getAssetUrl internally
   ```

3. **Remove getAssetUrl calls:**
   - ManagedImage automatically converts S3 paths
   - Just pass the relative path directly

4. **Test:**
   - Verify images load correctly
   - Test error scenarios (invalid URLs)
   - Check retry behavior in Network tab

## Special Cases

### ProductGallery.tsx
- Has custom error handling with `errorMap`
- Keep custom logic but consider using ManagedImage for base functionality
- May need to disable built-in error handling: `showPlaceholder={false}`

### Logo.tsx
- Critical component, test thoroughly
- Consider keeping as-is if it works reliably

### Admin Components
- Lower priority
- May want different error handling behavior
- Consider adding `fallback` prop for admin-specific placeholder

## Testing Checklist

For each migrated component:
- [ ] Images load on first try
- [ ] Retry works when network is slow
- [ ] Fallback shows when image is missing
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsive

## Notes

- ManagedImage has 2 automatic retries with exponential backoff
- Default fallback is `/images/placeholder.svg`
- Can customize with `fallback` prop
- Can disable placeholder with `showPlaceholder={false}`
