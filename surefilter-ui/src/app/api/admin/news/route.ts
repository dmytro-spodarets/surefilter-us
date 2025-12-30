import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

// GET /api/admin/news - Get all articles with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'NEWS' | 'EVENT' | null;
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null;
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const articles = await prisma.newsArticle.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { publishedAt: 'desc' }
      ]
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/news - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      type,
      title,
      excerpt,
      content,
      featuredImage,
      featuredImageAlt,
      categoryId,
      tags,
      author,
      publishedAt,
      status,
      // Event fields
      eventStartDate,
      eventEndDate,
      eventUrl,
      isFeatured,
      venue,
      location,
      booth,
      hall,
      eventType,
      attendees,
      // SEO
      metaTitle,
      metaDescription,
      ogImage
    } = body;

    // Validate required fields
    if (!slug || !title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Slug, title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.newsArticle.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 409 }
      );
    }

    const article = await prisma.newsArticle.create({
      data: {
        slug,
        type: type || 'NEWS',
        title,
        excerpt,
        content,
        featuredImage: featuredImage || null,
        featuredImageAlt: featuredImageAlt || null,
        categoryId: categoryId || null,
        tags: tags || [],
        author: author || null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        status: status || 'DRAFT',
        // Event fields
        eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
        eventUrl: eventUrl || null,
        isFeatured: isFeatured || false,
        venue: venue || null,
        location: location || null,
        booth: booth || null,
        hall: hall || null,
        eventType: eventType || null,
        attendees: attendees || null,
        // SEO
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

