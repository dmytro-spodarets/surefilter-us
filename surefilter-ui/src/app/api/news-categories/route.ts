import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/news-categories - Get active categories (public API)
export async function GET() {
  try {
    const categories = await prisma.newsCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { position: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
                publishedAt: {
                  lte: new Date()
                }
              }
            }
          }
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

