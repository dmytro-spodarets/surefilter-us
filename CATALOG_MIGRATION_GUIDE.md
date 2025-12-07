# Catalog Migration Guide - December 2025

## 🎯 Overview

This guide explains how to migrate to the new normalized catalog schema.

---

## ✅ What Changed

### Removed from Product model:
- ❌ `images` (Json) → Use `ProductMedia` instead
- ❌ `specsLeft` (Json) → Use `ProductSpecValue` instead
- ❌ `specsRight` (Json) → Use `ProductSpecValue` instead
- ❌ `oems` (Json) → Use `ProductCrossReference` instead
- ❌ `heightMm` (Float) → Use `ProductSpecValue` with parameter code "HEIGHT"
- ❌ `odMm` (Float) → Use `ProductSpecValue` with parameter code "OD"
- ❌ `idMm` (Float) → Use `ProductSpecValue` with parameter code "ID"
- ❌ `thread` (String) → Use `ProductSpecValue` with parameter code "THREAD"
- ❌ `model` (String) → Use `ProductSpecValue` with parameter code "MODEL"

### Added to Product model:
- ✅ `brandId` (String, required) → Link to Brand
- ✅ `media` (ProductMedia[]) → Normalized images
- ✅ `crossReferences` (ProductCrossReference[]) → Normalized OEM/competitor refs
- ✅ `specValues` (ProductSpecValue[]) → Already existed, now primary way

### New models:
- ✅ `Brand` - Multi-brand support
- ✅ `ProductMedia` - Normalized product images
- ✅ `ProductCrossReference` - Normalized cross-references

### Updated models:
- ✅ `SpecParameter` - Added `code` field for ACES/PIES

---

## 🚀 Migration Steps

### Step 1: Run Prisma Migration

```bash
cd surefilter-ui
npx prisma migrate dev --name catalog_normalization
```

This will:
- Create new tables: `Brand`, `ProductMedia`, `ProductCrossReference`
- Add `brandId` to `Product` table
- Add `code` to `SpecParameter` table
- Remove old JSON and flat fields from `Product`

### Step 2: Create Initial Data via Admin UI

After migration, use the admin UI to create:

1. **Brands** (`/admin/brands`)
   - Create "Sure Filter" brand
   - Add other brands as needed

2. **Specification Parameters** (`/admin/spec-parameters`)
   - Create standard parameters: HEIGHT, OD, ID, THREAD, etc.
   - Organize by categories: Dimensions, Performance, Material, etc.

### Step 3: Verify Database

```bash
npx prisma studio
```

Check that:
- ✅ New tables exist: Brand, ProductMedia, ProductCrossReference
- ✅ Product table has new structure (no JSON fields)
- ✅ All other tables (CMS, News, Forms, Resources) are untouched

---

## 📝 Creating Products (New Way)

### Example: Create product with all normalized data

```typescript
const product = await prisma.product.create({
  data: {
    code: 'SFO241',
    name: 'Engine Oil Filter',
    description: 'High-efficiency oil filter for heavy-duty applications',
    
    // Required: Link to brand
    brandId: 'sure-filter-brand-id',
    
    // Optional: Category and filter type
    category: 'HEAVY_DUTY',
    filterTypeId: 'oil-filter-type-id',
    
    status: 'Release Product',
    tags: ['oil', 'heavy-duty'],
    manufacturer: 'HYUNDAI',
    industries: ['Construction', 'Mining'],
    
    // Create normalized media
    media: {
      create: [
        {
          isPrimary: true,
          position: 0,
          caption: 'Main product image',
          assetId: 'media-asset-id-1'
        }
      ]
    },
    
    // Create normalized specs
    specValues: {
      create: [
        {
          parameterId: 'height-param-id', // SpecParameter with code "HEIGHT"
          value: '77',
          position: 0
        },
        {
          parameterId: 'od-param-id', // SpecParameter with code "OD"
          value: '93',
          position: 1
        }
      ]
    },
    
    // Create cross references
    crossReferences: {
      create: [
        {
          refBrandName: 'HYUNDAI',
          refCode: '26300-35503',
          referenceType: 'OEM',
          isPreferred: true
        }
      ]
    }
  }
});
```

---

## 🔄 Updating Admin UI

### Files to update:

1. **`/app/admin/products/ProductForm.tsx`**
   - Remove JSON textarea fields (images, specsLeft, specsRight, oems)
   - Remove flat dimension fields (heightMm, odMm, idMm, thread, model)
   - Add Brand selector
   - Add ProductMedia manager (image gallery)
   - Add ProductCrossReference manager (OEM table)
   - Keep ProductSpecValue editor (already exists)

2. **`/app/admin/products/page.tsx`**
   - Update query to include `brand`, `media`, `crossReferences`
   - Update table columns

3. **`/app/api/admin/products/route.ts`**
   - Remove JSON field validation
   - Add Brand validation
   - Add ProductMedia creation
   - Add ProductCrossReference creation

---

## 📊 Query Examples

### Get product with all data:

```typescript
const product = await prisma.product.findUnique({
  where: { code: 'SFO241' },
  include: {
    brand: true,
    filterType: true,
    media: {
      include: { asset: true },
      orderBy: [
        { isPrimary: 'desc' },
        { position: 'asc' }
      ]
    },
    specValues: {
      include: { parameter: true },
      orderBy: { position: 'asc' }
    },
    crossReferences: {
      orderBy: [
        { isPreferred: 'desc' },
        { referenceType: 'asc' }
      ]
    }
  }
});
```

### List products with primary image:

```typescript
const products = await prisma.product.findMany({
  include: {
    brand: true,
    media: {
      where: { isPrimary: true },
      take: 1,
      include: { asset: true }
    }
  }
});
```

---

## ✅ Checklist

- [ ] Run migration: `npx prisma migrate dev --name catalog_normalization`
- [ ] Seed catalog: `npm run seed:catalog`
- [ ] Verify in Prisma Studio
- [ ] Update ProductForm.tsx
- [ ] Update products API
- [ ] Test creating new product
- [ ] Test querying products
- [ ] Update catalog page to use new schema
- [ ] Update product detail page

---

## 🎉 Benefits

1. **Type Safety** - No more JSON parsing, full TypeScript support
2. **Performance** - Proper indexes, efficient queries
3. **Flexibility** - Easy to add/remove images, specs, cross-refs
4. **ACES/PIES Ready** - Stable codes for export
5. **Multi-brand** - Ready for future expansion
6. **Better UX** - Rich admin UI with drag-drop, galleries, etc.

---

**Status:** ✅ Schema ready, migration pending
**Next:** Run migration and update admin UI
