import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";

// Using shared prisma instance from lib/prisma

// Validation schema
const specParameterSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/, 'Code must contain only uppercase letters, numbers, and underscores').optional().nullable(),
  name: z.string().min(1, 'Name is required').max(100),
  unit: z.string().max(20).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/spec-parameters/[id] - Get single spec parameter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const parameter = await prisma.specParameter.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    if (!parameter) {
      return NextResponse.json(
        { error: 'Spec parameter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parameter);
  } catch (error: any) {
    console.error('Error fetching spec parameter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spec parameter', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/spec-parameters/[id] - Update spec parameter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = specParameterSchema.parse(body);

    // Check if parameter exists
    const existing = await prisma.specParameter.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Spec parameter not found' },
        { status: 404 }
      );
    }

    // Check if code conflicts with another parameter (if provided)
    if (validatedData.code) {
      const codeConflict = await prisma.specParameter.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { code: validatedData.code },
          ],
        },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: 'A parameter with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Update parameter
    const parameter = await prisma.specParameter.update({
      where: { id: id },
      data: {
        code: validatedData.code || null,
        name: validatedData.name,
        unit: validatedData.unit || null,
        category: validatedData.category || null,
        position: validatedData.position,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(parameter);
  } catch (error: any) {
    console.error('Error updating spec parameter:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update spec parameter', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/spec-parameters/[id] - Delete spec parameter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if parameter exists
    const parameter = await prisma.specParameter.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    if (!parameter) {
      return NextResponse.json(
        { error: 'Spec parameter not found' },
        { status: 404 }
      );
    }

    // Check if parameter has values
    if (parameter._count.values > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete parameter',
          details: `This parameter is used in ${parameter._count.values} product ${parameter._count.values === 1 ? 'specification' : 'specifications'}. Please remove them first.`,
        },
        { status: 400 }
      );
    }

    // Delete parameter
    await prisma.specParameter.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: 'Spec parameter deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting spec parameter:', error);
    return NextResponse.json(
      { error: 'Failed to delete spec parameter', details: error.message },
      { status: 500 }
    );
  }
}
