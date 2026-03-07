import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

const newsCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens').optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/news-categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;
    const category = await prisma.newsCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching news category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/news-categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = newsCategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Check if category exists
    const existing = await prisma.newsCategory.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another category
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.newsCategory.findFirst({
        where: {
          slug: data.slug,
          id: { not: id }
        }
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const category = await prisma.newsCategory.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        slug: data.slug ?? existing.slug,
        description: data.description !== undefined ? data.description : existing.description,
        color: data.color !== undefined ? data.color : existing.color,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        position: data.position !== undefined ? data.position : existing.position,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating news category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/news-categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;
    // Check if category exists
    const category = await prisma.newsCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has articles
    if (category._count.articles > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.articles} article(s). Please reassign or delete the articles first.` },
        { status: 409 }
      );
    }

    await prisma.newsCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

