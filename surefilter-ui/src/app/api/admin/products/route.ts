import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

// Using shared prisma instance from lib/prisma

// Validation schemas for nested data
const CategoryAssignmentSchema = z.object({
  categoryId: z.string().min(1),
  isPrimary: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

const SpecValueSchema = z.object({
  parameterId: z.string().min(1),
  value: z.string().min(1),
  unitOverride: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
});

const MediaItemSchema = z.object({
  assetId: z.string().min(1),
  isPrimary: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
  caption: z.string().optional().nullable(),
});

const CrossReferenceSchema = z.object({
  refBrandName: z.string().min(1),
  refCode: z.string().min(1),
  referenceType: z.string().default('OEM'),
  isPreferred: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

// Main product schema
const ProductSchema = z.object({
  code: z.string().min(1, 'Product code is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional().nullable(),
  brandId: z.string().min(1, 'Brand is required'),
  filterTypeId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  manufacturer: z.string().optional().nullable(),
  industries: z.array(z.string()).default([]),
  
  // Nested relations
  categoryAssignments: z.array(CategoryAssignmentSchema).default([]),
  specValues: z.array(SpecValueSchema).default([]),
  mediaItems: z.array(MediaItemSchema).default([]),
  crossReferences: z.array(CrossReferenceSchema).default([]),
});

// GET /api/admin/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const search = searchParams.get('q') || '';
    const brandId = searchParams.get('brandId');
    const categoryId = searchParams.get('categoryId');
    const filterTypeId = searchParams.get('filterTypeId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Увеличиваем для поиска
    const skip = (page - 1) * limit;

    // If specific IDs requested, return those products with full media
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      const products = await prisma.product.findMany({
        where: {
          id: { in: ids },
        },
        include: {
          brand: true,
          filterType: true,
          categories: {
            include: {
              category: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { position: 'asc' },
            ],
          },
          media: {
            include: {
              asset: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { position: 'asc' },
            ],
            take: 1, // Только первое изображение
          },
        },
      });
      
      // Сортируем в том же порядке что и ids
      const sortedProducts = ids
        .map(id => products.find(p => p.id === id))
        .filter(Boolean);
      
      return NextResponse.json({ products: sortedProducts });
    }

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (brandId) {
      where.brandId = brandId;
    }
    
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }
    
    if (filterTypeId) {
      where.filterTypeId = filterTypeId;
    }
    
    if (status) {
      where.status = status;
    }

    // Get products with media for search/list view
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [
          { code: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          brand: true,
          filterType: true,
          categories: {
            include: {
              category: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { position: 'asc' },
            ],
          },
          media: {
            include: {
              asset: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { position: 'asc' },
            ],
            take: 1, // Только первое изображение для списка
          },
          _count: {
            select: {
              specValues: true,
              media: true,
              crossReferences: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = ProductSchema.parse(body);

    // Check if code already exists
    const existingCode = await prisma.product.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'A product with this code already exists' },
        { status: 400 }
      );
    }

    // Create product with all nested relations in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          code: validatedData.code,
          name: validatedData.name,
          description: validatedData.description || null,
          brandId: validatedData.brandId,
          filterTypeId: validatedData.filterTypeId || null,
          status: validatedData.status || null,
          tags: validatedData.tags,
          manufacturer: validatedData.manufacturer || null,
          industries: validatedData.industries,
        },
      });

      // Create category assignments
      if (validatedData.categoryAssignments.length > 0) {
        await tx.productCategoryAssignment.createMany({
          data: validatedData.categoryAssignments.map(ca => ({
            productId: newProduct.id,
            categoryId: ca.categoryId,
            isPrimary: ca.isPrimary,
            position: ca.position,
          })),
        });
      }

      // Create spec values
      if (validatedData.specValues.length > 0) {
        await tx.productSpecValue.createMany({
          data: validatedData.specValues.map(sv => ({
            productId: newProduct.id,
            parameterId: sv.parameterId,
            value: sv.value,
            unitOverride: sv.unitOverride || null,
            position: sv.position,
          })),
        });
      }

      // Create media items
      if (validatedData.mediaItems.length > 0) {
        await tx.productMedia.createMany({
          data: validatedData.mediaItems.map(mi => ({
            productId: newProduct.id,
            assetId: mi.assetId,
            isPrimary: mi.isPrimary,
            position: mi.position,
            caption: mi.caption || null,
          })),
        });
      }

      // Create cross references
      if (validatedData.crossReferences.length > 0) {
        await tx.productCrossReference.createMany({
          data: validatedData.crossReferences.map(cr => ({
            productId: newProduct.id,
            refBrandName: cr.refBrandName,
            refCode: cr.refCode,
            referenceType: cr.referenceType,
            isPreferred: cr.isPreferred,
            notes: cr.notes || null,
          })),
        });
      }

      // Return product with all relations
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          brand: true,
          filterType: true,
          categories: {
            include: { category: true },
          },
          specValues: {
            include: { parameter: true },
          },
          media: {
            include: { asset: true },
          },
          crossReferences: true,
        },
      });
    });

    // Log action
    const session = await getServerSession(authOptions);
    if (session) {
      const metadata = getRequestMetadata(request);
      await logAdminAction({
        userId: (session as any).userId,
        action: 'CREATE',
        entityType: 'Product',
        entityId: product.id,
        entityName: product.code,
        details: { name: product.name },
        ...metadata,
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}
