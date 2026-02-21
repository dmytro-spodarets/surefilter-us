import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { invalidatePages } from '@/lib/revalidate';

// GET /api/admin/shared-sections/[id] - получить одну общую секцию
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const sharedSection = await prisma.sharedSection.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            pages: {
              include: {
                page: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            sections: true
          }
        }
      }
    });

    if (!sharedSection) {
      return NextResponse.json(
        { error: 'Shared section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sharedSection });
  } catch (error) {
    console.error('Error fetching shared section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared section' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shared-sections/[id] - обновить общую секцию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, type, data, description } = body;

    const sharedSection = await prisma.sharedSection.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(data && { data }),
        ...(description !== undefined && { description }),
      },
      include: {
        sections: {
          include: {
            pages: {
              include: {
                page: {
                  select: { slug: true }
                }
              }
            }
          }
        }
      }
    });

    // Revalidate all pages that use this shared section
    try {
      const uniqueSlugs = new Set<string>();
      sharedSection.sections.forEach(section => {
        section.pages.forEach(pageSection => {
          uniqueSlugs.add(pageSection.page.slug);
        });
      });
      const paths = [...uniqueSlugs].map(s => s === 'home' ? '/' : `/${s}`);
      const tags = [...uniqueSlugs].map(s => `page:${s}`);
      await invalidatePages(paths, tags);
    } catch (error) {
      console.error('Error revalidating pages:', error);
    }

    return NextResponse.json({ sharedSection });
  } catch (error) {
    console.error('Error updating shared section:', error);
    return NextResponse.json(
      { error: 'Failed to update shared section' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/shared-sections/[id] - удалить общую секцию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Проверяем, используется ли секция
    const usageCount = await prisma.section.count({
      where: { sharedSectionId: id }
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete shared section that is in use',
          usageCount 
        },
        { status: 400 }
      );
    }

    await prisma.sharedSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared section:', error);
    return NextResponse.json(
      { error: 'Failed to delete shared section' },
      { status: 500 }
    );
  }
}
