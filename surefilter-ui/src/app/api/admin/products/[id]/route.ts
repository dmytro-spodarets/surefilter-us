import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";

// Using shared prisma instance from lib/prisma

// Validation schemas (same as in route.ts)
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
  
  categoryAssignments: z.array(CategoryAssignmentSchema).default([]),
  specValues: z.array(SpecValueSchema).default([]),
  mediaItems: z.array(MediaItemSchema).default([]),
  crossReferences: z.array(CrossReferenceSchema).default([]),
});

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
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
        specValues: {
          include: {
            parameter: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
        media: {
          include: {
            asset: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { position: 'asc' },
          ],
        },
        crossReferences: {
          orderBy: [
            { isPreferred: 'desc' },
            { refBrandName: 'asc' },
          ],
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = ProductSchema.parse(body);

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if code conflicts with another product
    if (validatedData.code !== existing.code) {
      const codeConflict = await prisma.product.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { code: validatedData.code },
          ],
        },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: 'A product with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Update product with all nested relations in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id: id },
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

      // Update category assignments (delete all and recreate)
      await tx.productCategoryAssignment.deleteMany({
        where: { productId: id },
      });
      
      if (validatedData.categoryAssignments.length > 0) {
        await tx.productCategoryAssignment.createMany({
          data: validatedData.categoryAssignments.map(ca => ({
            productId: id,
            categoryId: ca.categoryId,
            isPrimary: ca.isPrimary,
            position: ca.position,
          })),
        });
      }

      // Update spec values (delete all and recreate)
      await tx.productSpecValue.deleteMany({
        where: { productId: id },
      });
      
      if (validatedData.specValues.length > 0) {
        await tx.productSpecValue.createMany({
          data: validatedData.specValues.map(sv => ({
            productId: id,
            parameterId: sv.parameterId,
            value: sv.value,
            unitOverride: sv.unitOverride || null,
            position: sv.position,
          })),
        });
      }

      // Update media items (delete all and recreate)
      await tx.productMedia.deleteMany({
        where: { productId: id },
      });
      
      if (validatedData.mediaItems.length > 0) {
        await tx.productMedia.createMany({
          data: validatedData.mediaItems.map(mi => ({
            productId: id,
            assetId: mi.assetId,
            isPrimary: mi.isPrimary,
            position: mi.position,
            caption: mi.caption || null,
          })),
        });
      }

      // Update cross references (delete all and recreate)
      await tx.productCrossReference.deleteMany({
        where: { productId: id },
      });
      
      if (validatedData.crossReferences.length > 0) {
        await tx.productCrossReference.createMany({
          data: validatedData.crossReferences.map(cr => ({
            productId: id,
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
        where: { id: id },
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

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
