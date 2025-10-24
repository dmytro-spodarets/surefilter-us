import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/news-categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.newsCategory.findMany({
      orderBy: [
        { position: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching news categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/news-categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, color, icon, position, isActive } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.newsCategory.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.newsCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || null,
        icon: icon || null,
        position: position ?? 0,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating news category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

