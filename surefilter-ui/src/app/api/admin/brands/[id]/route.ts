import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";

// Using shared prisma instance from lib/prisma

// Validation schema
const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers').optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  website: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = brandSchema.parse(body);

    // Check if brand exists
    const existing = await prisma.brand.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if name conflicts with another brand
    const nameConflict = await prisma.brand.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { name: validatedData.name },
        ],
      },
    });

    if (nameConflict) {
      return NextResponse.json(
        { error: 'A brand with this name already exists' },
        { status: 400 }
      );
    }

    // Check if code conflicts with another brand (if provided)
    if (validatedData.code) {
      const codeConflict = await prisma.brand.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { code: validatedData.code },
          ],
        },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: 'A brand with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Update brand
    const brand = await prisma.brand.update({
      where: { id: id },
      data: {
        ...validatedData,
        code: validatedData.code || null,
        description: validatedData.description || null,
        logoUrl: validatedData.logoUrl || null,
        website: validatedData.website || null,
      },
    });

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error('Error updating brand:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update brand', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if brand has products
    if (brand._count.products > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete brand',
          details: `This brand has ${brand._count.products} products. Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    // Delete brand
    await prisma.brand.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand', details: error.message },
      { status: 500 }
    );
  }
}
