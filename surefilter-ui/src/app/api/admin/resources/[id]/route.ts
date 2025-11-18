import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  thumbnailImage: z.string().optional(),
  file: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.string().optional(),
  fileMeta: z.string().optional(),
  categoryId: z.string().optional(),
  formId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

// GET /api/admin/resources/[id] - Get single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
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

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/resources/[id] - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateResourceSchema.parse(body);

    // Check if resource exists
    const existing = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.resource.findFirst({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Resource with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const resourceData: any = {};
    
    // Only include fields that are present in the request
    if (data.title !== undefined) resourceData.title = data.title;
    if (data.slug !== undefined) resourceData.slug = data.slug;
    if (data.description !== undefined) resourceData.description = data.description;
    if (data.shortDescription !== undefined) resourceData.shortDescription = data.shortDescription || undefined;
    if (data.thumbnailImage !== undefined) resourceData.thumbnailImage = data.thumbnailImage || undefined;
    if (data.file !== undefined) resourceData.file = data.file;
    if (data.fileType !== undefined) resourceData.fileType = data.fileType;
    if (data.fileSize !== undefined) resourceData.fileSize = data.fileSize || undefined;
    if (data.fileMeta !== undefined) resourceData.fileMeta = data.fileMeta || undefined;
    if (data.categoryId !== undefined) resourceData.categoryId = data.categoryId;
    if (data.formId !== undefined) resourceData.formId = data.formId || null;
    if (data.metaTitle !== undefined) resourceData.metaTitle = data.metaTitle || undefined;
    if (data.metaDescription !== undefined) resourceData.metaDescription = data.metaDescription || undefined;
    if (data.ogImage !== undefined) resourceData.ogImage = data.ogImage || undefined;
    
    // Handle status and publishedAt
    if (data.status !== undefined) {
      resourceData.status = data.status;
      
      // If changing to PUBLISHED, set publishedAt if not already set
      if (data.status === 'PUBLISHED' && !existing.publishedAt) {
        if (data.publishedAt && data.publishedAt.trim() !== '') {
          resourceData.publishedAt = new Date(data.publishedAt);
        } else {
          resourceData.publishedAt = new Date();
        }
      }
    }
    
    // If publishedAt is explicitly provided, update it
    if (data.publishedAt !== undefined) {
      if (data.publishedAt && data.publishedAt.trim() !== '') {
        resourceData.publishedAt = new Date(data.publishedAt);
      } else {
        resourceData.publishedAt = null;
      }
    }

    const resource = await prisma.resource.update({
      where: { id },
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

    return NextResponse.json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resources/[id] - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}

