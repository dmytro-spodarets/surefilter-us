import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/news/[id] - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!article) {
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

// PUT /api/admin/news/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if article exists
    const existing = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another article
    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.newsArticle.findFirst({
        where: {
          slug: body.slug,
          id: { not: id }
        }
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'Article with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    // Only update fields that are provided
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage;
    if (body.featuredImageAlt !== undefined) updateData.featuredImageAlt = body.featuredImageAlt;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.publishedAt !== undefined) updateData.publishedAt = new Date(body.publishedAt);
    if (body.status !== undefined) updateData.status = body.status;
    
    // Event fields
    if (body.eventStartDate !== undefined) updateData.eventStartDate = body.eventStartDate ? new Date(body.eventStartDate) : null;
    if (body.eventEndDate !== undefined) updateData.eventEndDate = body.eventEndDate ? new Date(body.eventEndDate) : null;
    if (body.eventUrl !== undefined) updateData.eventUrl = body.eventUrl;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.venue !== undefined) updateData.venue = body.venue;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.booth !== undefined) updateData.booth = body.booth;
    if (body.hall !== undefined) updateData.hall = body.hall;
    if (body.eventType !== undefined) updateData.eventType = body.eventType;
    if (body.attendees !== undefined) updateData.attendees = body.attendees;
    
    // SEO fields
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.ogImage !== undefined) updateData.ogImage = body.ogImage;

    const article = await prisma.newsArticle.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/news/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if article exists
    const article = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    await prisma.newsArticle.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

