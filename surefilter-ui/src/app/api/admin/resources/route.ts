import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  thumbnailImage: z.string().optional(),
  file: z.string().min(1, 'File is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.string().optional(),
  fileMeta: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  formId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

// GET /api/admin/resources - List all resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.resource.count({ where });

    // Get resources
    const resources = await prisma.resource.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

// POST /api/admin/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateResourceSchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.resource.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Resource with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare resource data
    const resourceData: any = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription || undefined,
      thumbnailImage: data.thumbnailImage || undefined,
      file: data.file,
      fileType: data.fileType,
      fileSize: data.fileSize || undefined,
      fileMeta: data.fileMeta || undefined,
      categoryId: data.categoryId,
      formId: data.formId || null,
      status: data.status,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      ogImage: data.ogImage || undefined,
    };

    // Handle publishedAt based on status
    if (data.status === 'PUBLISHED') {
      // If published, set publishedAt to provided date or current date
      if (data.publishedAt && data.publishedAt.trim() !== '') {
        resourceData.publishedAt = new Date(data.publishedAt);
      } else {
        resourceData.publishedAt = new Date();
      }
    } else {
      // For DRAFT/ARCHIVED, don't set publishedAt
      resourceData.publishedAt = undefined;
    }

    const resource = await prisma.resource.create({
      data: resourceData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

