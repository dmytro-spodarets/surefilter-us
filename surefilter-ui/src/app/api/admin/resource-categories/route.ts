import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  position: z.number().default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/resource-categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const categories = await prisma.resourceCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching resource categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/resource-categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateCategorySchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.resourceCategory.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.resourceCategory.create({
      data,
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

