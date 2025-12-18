import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/admin/product-filter-types/[id] - Get single filter type
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const filterType = await prisma.productFilterType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!filterType) {
      return NextResponse.json({ error: 'Filter type not found' }, { status: 404 });
    }

    return NextResponse.json(filterType);
  } catch (error) {
    console.error('Error fetching product filter type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product filter type' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/product-filter-types/[id] - Update filter type
const updateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  position: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Convert empty strings to null for optional unique fields
    const cleanData = {
      ...data,
      code: data.code?.trim() || null,
    };

    const filterType = await prisma.productFilterType.update({
      where: { id },
      data: cleanData,
    });

    return NextResponse.json(filterType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating product filter type:', error);
    return NextResponse.json(
      { error: 'Failed to update product filter type' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/product-filter-types/[id] - Delete filter type
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if filter type is used by any products
    const productsCount = await prisma.product.count({
      where: { filterTypeId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete filter type. It is used by ${productsCount} product(s)` },
        { status: 400 }
      );
    }

    await prisma.productFilterType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product filter type:', error);
    return NextResponse.json(
      { error: 'Failed to delete product filter type' },
      { status: 500 }
    );
  }
}
