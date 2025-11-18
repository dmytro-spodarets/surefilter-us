import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/resources/categories - List active categories (public)
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.resourceCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            resources: {
              where: {
                status: 'PUBLISHED',
                publishedAt: {
                  lte: new Date(),
                },
              },
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

