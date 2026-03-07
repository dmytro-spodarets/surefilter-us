import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

const newsCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(500).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/news-categories - Get all categories
export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

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
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const body = await request.json();
    const parsed = newsCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Check if slug already exists
    const existing = await prisma.newsCategory.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.newsCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        color: data.color || null,
        icon: data.icon || null,
        position: data.position,
        isActive: data.isActive,
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

