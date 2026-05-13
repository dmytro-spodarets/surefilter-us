import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { invalidatePages } from '@/lib/revalidate';

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  image: z.string().optional(),
  position: z.number().default(0),
  isActive: z.boolean().default(true),
  parentId: z.string().nullable().optional(),
});

// GET /api/admin/resource-categories - List all categories (flat list with parent info)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const parentOnly = searchParams.get('parentOnly') === 'true';

    const where: any = {};

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (parentOnly) {
      where.parentId = null;
    }

    const categories = await prisma.resourceCategory.findMany({
      where,
      include: {
        _count: {
          select: { resources: true, children: true },
        },
        parent: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
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
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const body = await request.json();
    const data = CreateCategorySchema.parse(body);

    // Slug uniqueness
    const existing = await prisma.resourceCategory.findFirst({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Enforce max depth = 2: parent cannot itself have a parent
    if (data.parentId) {
      const parent = await prisma.resourceCategory.findUnique({
        where: { id: data.parentId },
        select: { id: true, parentId: true },
      });
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
      if (parent.parentId) {
        return NextResponse.json(
          { error: 'Cannot nest subcategories more than one level deep' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.resourceCategory.create({
      data,
      include: {
        _count: { select: { resources: true, children: true } },
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    invalidatePages(['/resources', '/resources/*']).catch(() => {});

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
