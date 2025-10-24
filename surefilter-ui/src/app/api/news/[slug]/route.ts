import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/news/[slug] - Get single published article by slug (public API)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await prisma.newsArticle.findUnique({
      where: {
        slug
      },
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
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if article is published and not in the future
    if (article.status !== 'PUBLISHED' || article.publishedAt > new Date()) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

