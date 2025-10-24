import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/news - Get published articles (public API)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'NEWS' | 'EVENT' | null;
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const featured = searchParams.get('featured') === 'true';

    const where: any = {
      status: 'PUBLISHED',
      publishedAt: {
        lte: new Date() // Only show articles published in the past/now
      }
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    
    // For featured events, only show future events
    if (featured && type === 'EVENT') {
      where.isFeatured = true;
      where.eventStartDate = {
        gte: new Date() // Future events only
      };
    }

    // Determine ordering based on type
    const orderBy: any = [];
    if (type === 'EVENT' && featured) {
      // Featured events: sort by event start date (soonest first)
      orderBy.push({ eventStartDate: 'asc' });
    } else if (type === 'EVENT') {
      // Regular events: sort by event start date (newest/future first)
      orderBy.push({ eventStartDate: 'desc' });
    } else {
      // News: sort by publish date (newest first)
      orderBy.push({ publishedAt: 'desc' });
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              icon: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.newsArticle.count({ where })
    ]);

    return NextResponse.json({
      articles,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

