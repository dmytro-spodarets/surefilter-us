# Catalog Schema Redesign - December 2025

## 🎯 Overview

This document describes the redesigned catalog schema for Sure Filter US product database. The new schema is normalized, future-proof, and ready for ACES/PIES exports.

---

## 📊 Updated Models

### 1. **Brand** (NEW)
Multi-brand support for future expansion and ACES/PIES compatibility.

```prisma
model Brand {
  id          String    @id @default(cuid())
  name        String    @unique // "Sure Filter", "Premium Guard"
  code        String?   @unique // Short code for ACES/PIES (e.g., "SF", "PG")
  description String?   @db.Text
  logoUrl     String?   // Brand logo S3 path
  website     String?   // Brand website URL
  isActive    Boolean   @default(true)
  position    Int       @default(0)
  
  products Product[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Features:**
- ✅ Supports multiple brands (even though we have one now)
- ✅ ACES/PIES ready with `code` field
- ✅ Brand logo and website support
- ✅ Active/inactive status for brand management

---

### 2. **Product** (UPDATED)
Enhanced with brand relationship and normalized relations.

```prisma
model Product {
  id          String  @id @default(cuid())
  code        String  @unique
  name        String
  description String?

  // Brand relationship (REQUIRED)
  brandId String
  brand   Brand  @relation(fields: [brandId], references: [id])

  // Category and FilterType (optional)
  category     FilterCategory?
  filterTypeId String?
  filterType   FilterType?

  status String? // 'Release Product', 'Discontinued'

  // LEGACY fields - TODO: migrate to normalized models
  images     Json // TODO: legacy, use ProductMedia instead
  specsLeft  Json // TODO: legacy, use ProductSpecValue instead
  specsRight Json // TODO: legacy, use ProductSpecValue instead
  oems       Json // TODO: legacy, use ProductCrossReference instead

  // Metadata
  tags         String[]
  manufacturer String?
  industries   String[]

  // Dimensions - TODO: duplicate of normalized spec
  heightMm Float?
  odMm     Float?
  idMm     Float?
  thread   String?
  model    String?

  // Normalized relationships
  specValues      ProductSpecValue[]
  media           ProductMedia[]
  crossReferences ProductCrossReference[]
}
```

**Changes:**
- ✅ **Required** `brandId` relationship
- ✅ New normalized relations: `media`, `crossReferences`
- ✅ Legacy JSON fields marked with `// TODO: legacy` comments
- ✅ Flat dimension fields marked as duplicates for migration

---

### 3. **ProductMedia** (NEW)
Normalized product images with ordering and primary image support.

```prisma
model ProductMedia {
  id        String  @id @default(cuid())
  productId String
  assetId   String
  
  isPrimary Boolean @default(false) // Only one primary per product
  position  Int     @default(0)     // Gallery order
  caption   String? // Optional caption
  
  product Product    @relation(...)
  asset   MediaAsset @relation(...)
  
  @@unique([productId, assetId])
  @@index([productId, position])
  @@index([productId, isPrimary])
}
```

**Key Features:**
- ✅ Links `Product` ↔ `MediaAsset`
- ✅ `isPrimary` flag for main product image
- ✅ `position` for gallery ordering
- ✅ Optional `caption` for each image
- ✅ Cascade delete when product is deleted

---

### 4. **ProductCrossReference** (NEW)
Normalized OEM numbers, competitor cross-references, and interchanges.

```prisma
model ProductCrossReference {
  id        String  @id @default(cuid())
  productId String
  
  refBrandName String  // "HYUNDAI", "Fleetguard", "Baldwin"
  refBrandId   String? // Optional link to Brand model
  refCode      String  // "26300-35503", "LF3000"
  
  referenceType String  @default("OEM") // "OEM", "Competitor", "Supersedes"
  isPreferred   Boolean @default(false)
  notes         String? @db.Text
  
  product Product @relation(...)
  
  @@unique([productId, refBrandName, refCode])
  @@index([refCode]) // For reverse lookup
}
```

**Key Features:**
- ✅ Replaces legacy `oems` JSON field
- ✅ Supports multiple reference types (OEM, Competitor, Supersedes)
- ✅ `isPreferred` flag for primary cross-reference
- ✅ Reverse lookup by `refCode` (find our product by OEM number)
- ✅ Optional link to `Brand` if reference brand is in our system

---

### 5. **SpecParameter** (UPDATED)
Enhanced with stable `code` field for ACES/PIES.

```prisma
model SpecParameter {
  id       String  @id @default(cuid())
  code     String? @unique // NEW: Stable code (e.g., "HEIGHT", "OD")
  name     String  // Display name
  unit     String? // Default unit
  category String? // Grouping category
  position Int     @default(0)
  isActive Boolean @default(true)
  
  values ProductSpecValue[]
}
```

**Changes:**
- ✅ New `code` field for stable ACES/PIES export
- ✅ Unique constraint on `code`
- ✅ Better indexing for performance

---

### 6. **ProductSpecValue** (UPDATED)
Minor improvements for better indexing.

```prisma
model ProductSpecValue {
  id           String  @id @default(cuid())
  productId    String
  parameterId  String
  value        String
  unitOverride String?
  position     Int     @default(0)

  product   Product       @relation(...)
  parameter SpecParameter @relation(...)

  @@unique([productId, parameterId])
  @@index([productId, position])
  @@index([parameterId]) // NEW: Better performance
}
```

**Changes:**
- ✅ Added index on `parameterId` for reverse lookups

---

### 7. **MediaAsset** (UPDATED)
Added relation to ProductMedia.

```prisma
model MediaAsset {
  // ... existing fields ...
  
  // Relations
  productMedia ProductMedia[] // NEW
}
```

---

## 🔗 Relationships Diagram

```
Brand (1) ──────────────> (N) Product
                               │
                               ├──> (N) ProductMedia ──> (1) MediaAsset
                               ├──> (N) ProductSpecValue ──> (1) SpecParameter
                               └──> (N) ProductCrossReference

FilterType (1) ──────────> (N) Product
```

---

## 📝 Migration Strategy

### Phase 1: Add new models (DONE)
- ✅ Create `Brand` model
- ✅ Create `ProductMedia` model
- ✅ Create `ProductCrossReference` model
- ✅ Update `SpecParameter` with `code` field
- ✅ Add `brandId` to `Product` (required)

### Phase 2: Data migration (TODO)
1. Create default "Sure Filter" brand
2. Migrate existing products to use default brand
3. Migrate `images` JSON → `ProductMedia` records
4. Migrate `oems` JSON → `ProductCrossReference` records
5. Migrate flat dimensions → `ProductSpecValue` records

### Phase 3: Cleanup (TODO)
1. Remove legacy JSON fields (`images`, `oems`, `specsLeft`, `specsRight`)
2. Remove flat dimension fields (`heightMm`, `odMm`, `idMm`, `thread`, `model`)
3. Update all queries to use normalized models

---

## 🔍 Prisma Query Examples

### Example 1: Fetch product with all normalized data

```typescript
const product = await prisma.product.findUnique({
  where: { code: 'SFO241' },
  include: {
    brand: true,
    filterType: true,
    
    // Get primary image and all gallery images
    media: {
      include: { asset: true },
      orderBy: [
        { isPrimary: 'desc' }, // Primary first
        { position: 'asc' }    // Then by position
      ]
    },
    
    // Get all normalized specifications
    specValues: {
      include: { parameter: true },
      orderBy: { position: 'asc' }
    },
    
    // Get all cross references (OEM, competitor)
    crossReferences: {
      orderBy: [
        { isPreferred: 'desc' },
        { referenceType: 'asc' }
      ]
    }
  }
});

// Access data:
console.log(product.brand.name); // "Sure Filter"
console.log(product.media[0].asset.cdnUrl); // Primary image URL
console.log(product.specValues[0].parameter.name); // "Height"
console.log(product.crossReferences[0].refCode); // "26300-35503"
```

---

### Example 2: List products in FilterType with primary images

```typescript
const products = await prisma.product.findMany({
  where: {
    filterTypeId: 'oil-filter-type-id',
    status: 'Release Product'
  },
  include: {
    brand: true,
    
    // Only get primary image
    media: {
      where: { isPrimary: true },
      take: 1,
      include: { asset: true }
    }
  },
  orderBy: { code: 'asc' }
});

// Access data:
products.forEach(p => {
  console.log(`${p.code} - ${p.name}`);
  console.log(`Brand: ${p.brand.name}`);
  console.log(`Image: ${p.media[0]?.asset.cdnUrl || 'No image'}`);
});
```

---

### Example 3: Find product by OEM cross-reference

```typescript
// Reverse lookup: find our product by OEM number
const crossRef = await prisma.productCrossReference.findFirst({
  where: {
    refCode: '26300-35503',
    referenceType: 'OEM'
  },
  include: {
    product: {
      include: {
        brand: true,
        media: {
          where: { isPrimary: true },
          take: 1,
          include: { asset: true }
        }
      }
    }
  }
});

if (crossRef) {
  console.log(`OEM ${crossRef.refCode} matches:`);
  console.log(`${crossRef.product.brand.name} ${crossRef.product.code}`);
}
```

---

### Example 4: Get all products for a brand with specs

```typescript
const brandProducts = await prisma.product.findMany({
  where: {
    brandId: 'sure-filter-brand-id',
    category: 'HEAVY_DUTY'
  },
  include: {
    filterType: true,
    
    // Get specific specs by parameter code
    specValues: {
      where: {
        parameter: {
          code: { in: ['HEIGHT', 'OD', 'THREAD'] }
        }
      },
      include: { parameter: true }
    }
  }
});
```

---

### Example 5: Create product with normalized data

```typescript
const newProduct = await prisma.product.create({
  data: {
    code: 'SFO500',
    name: 'Extended Life Oil Filter',
    description: 'High-efficiency oil filter for extended service intervals',
    
    // Link to brand
    brandId: 'sure-filter-brand-id',
    
    // Link to filter type
    filterTypeId: 'oil-filter-type-id',
    category: 'HEAVY_DUTY',
    
    status: 'Release Product',
    tags: ['extended-life', 'high-efficiency'],
    industries: ['Construction', 'Mining'],
    
    // Legacy fields (for now)
    images: [],
    specsLeft: [],
    specsRight: [],
    oems: [],
    
    // Create normalized media
    media: {
      create: [
        {
          isPrimary: true,
          position: 0,
          caption: 'Main product image',
          assetId: 'media-asset-id-1'
        },
        {
          isPrimary: false,
          position: 1,
          caption: 'Side view',
          assetId: 'media-asset-id-2'
        }
      ]
    },
    
    // Create normalized specs
    specValues: {
      create: [
        {
          parameterId: 'height-param-id',
          value: '120',
          position: 0
        },
        {
          parameterId: 'od-param-id',
          value: '93',
          position: 1
        }
      ]
    },
    
    // Create cross references
    crossReferences: {
      create: [
        {
          refBrandName: 'KOMATSU',
          refCode: '600-211-1340',
          referenceType: 'OEM',
          isPreferred: true
        },
        {
          refBrandName: 'Fleetguard',
          refCode: 'LF3000',
          referenceType: 'Competitor'
        }
      ]
    }
  }
});
```

---

## 🚀 Next Steps

### Immediate (Required for migration)
1. Run `npx prisma migrate dev --name add_catalog_normalization`
2. Create seed script to create default "Sure Filter" brand
3. Update existing products to use default brand ID

### Short-term (Data migration)
1. Create migration script for `images` → `ProductMedia`
2. Create migration script for `oems` → `ProductCrossReference`
3. Create migration script for dimensions → `ProductSpecValue`

### Long-term (Cleanup)
1. Update all admin UI to use normalized models
2. Update all API endpoints to use normalized models
3. Remove legacy JSON fields from schema
4. Add ACES/PIES export functionality

---

## ✅ Benefits of New Schema

1. **Normalized Data**
   - No JSON parsing required
   - Type-safe queries
   - Better performance with proper indexes

2. **ACES/PIES Ready**
   - `Brand.code` for brand codes
   - `SpecParameter.code` for stable parameter codes
   - `ProductCrossReference` for OEM/competitor mapping

3. **Flexible Media Management**
   - Multiple images per product
   - Primary image designation
   - Gallery ordering
   - Image captions

4. **Better Cross-References**
   - Reverse lookup by OEM number
   - Multiple reference types
   - Preferred reference marking
   - Notes for each reference

5. **Future-Proof**
   - Multi-brand support
   - Easy to extend
   - Clean migration path

---

**Last Updated:** December 7, 2025
**Schema Version:** 2.0
**Status:** ✅ Schema updated, migration pending
