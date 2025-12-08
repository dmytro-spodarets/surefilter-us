import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";

// Using shared prisma instance from lib/prisma

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  icon: z.string().optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const category = await prisma.productCategory.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            productCategories: true,
            filterTypes: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = categorySchema.parse(body);

    // Check if category exists
    const existing = await prisma.productCategory.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if name or slug conflicts with another category
    const conflict = await prisma.productCategory.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { name: validatedData.name },
              { slug: validatedData.slug },
            ],
          },
        ],
      },
    });

    if (conflict) {
      if (conflict.name === validatedData.name) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        );
      }
      if (conflict.slug === validatedData.slug) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update category
    const category = await prisma.productCategory.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            productCategories: true,
            filterTypes: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products or filter types
    const hasProducts = category._count.productCategories > 0;
    const hasFilterTypes = category._count.filterTypes > 0;

    if (hasProducts || hasFilterTypes) {
      return NextResponse.json(
        {
          error: 'Cannot delete category',
          details: `This category has ${category._count.productCategories} products and ${category._count.filterTypes} filter types. Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.productCategory.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}
