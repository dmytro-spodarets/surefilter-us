import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { invalidatePages } from '@/lib/revalidate';

const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  image: z.string().optional(),
  position: z.number().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
});

// GET /api/admin/resource-categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;

    const category = await prisma.resourceCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { resources: true, children: true } },
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/resource-categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;
    const body = await request.json();
    const data = UpdateCategorySchema.parse(body);

    const existing = await prisma.resourceCategory.findUnique({
      where: { id },
      include: { children: { select: { id: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.resourceCategory.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

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

      // If this category itself has children, it cannot become a subcategory
      if (existing.children.length > 0) {
        return NextResponse.json(
          { error: 'Cannot move a category with subcategories under another parent' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.resourceCategory.update({
      where: { id },
      data,
      include: {
        _count: { select: { resources: true, children: true } },
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    invalidatePages(['/resources', '/resources/*']).catch(() => {});

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resource-categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;

    const existing = await prisma.resourceCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { resources: true, children: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (existing._count.resources > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is being used by ${existing._count.resources} resource(s)` },
        { status: 400 }
      );
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It has ${existing._count.children} subcategor(y/ies). Delete or reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.resourceCategory.delete({ where: { id } });

    invalidatePages(['/resources', '/resources/*']).catch(() => {});

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
