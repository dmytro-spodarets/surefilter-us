import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/news-categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, color, icon, position, isActive } = body;

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
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.newsCategory.findFirst({
        where: {
          slug,
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
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
        description: description !== undefined ? description : existing.description,
        color: color !== undefined ? color : existing.color,
        icon: icon !== undefined ? icon : existing.icon,
        position: position !== undefined ? position : existing.position,
        isActive: isActive !== undefined ? isActive : existing.isActive
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

