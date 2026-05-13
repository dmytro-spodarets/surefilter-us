import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publicApiLimiter, getClientIp } from '@/lib/rate-limiter';

// GET /api/resources - List published resources (public)
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = publicApiLimiter.check(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const subcategorySlug = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12') || 12, 100);
    const skip = (page - 1) * limit;

    const filters: any[] = [];

    if (subcategorySlug) {
      filters.push({
        category: {
          slug: subcategorySlug,
          isActive: true,
          ...(categorySlug
            ? { parent: { slug: categorySlug, isActive: true } }
            : {}),
        },
      });
    } else if (categorySlug) {
      filters.push({
        OR: [
          { category: { slug: categorySlug, isActive: true } },
          {
            category: {
              isActive: true,
              parent: { slug: categorySlug, isActive: true },
            },
          },
        ],
      });
    }

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: any = {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      ...(filters.length > 0 ? { AND: filters } : {}),
    };

    const total = await prisma.resource.count({ where });

    const resources = await prisma.resource.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnailImage: true,
        file: true,
        fileType: true,
        fileSize: true,
        fileMeta: true,
        allowDirectDownload: true,
        allowPreview: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
