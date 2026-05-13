import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/resources/categories - List active top-level categories with their subcategories (public)
export async function GET(_request: NextRequest) {
  try {
    const publishedResourceFilter = {
      status: 'PUBLISHED' as const,
      publishedAt: { lte: new Date() },
    };

    const categories = await prisma.resourceCategory.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      include: {
        _count: {
          select: { resources: { where: publishedResourceFilter } },
        },
        children: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: { resources: { where: publishedResourceFilter } },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
