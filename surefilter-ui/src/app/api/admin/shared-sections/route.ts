import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/shared-sections - список всех общих секций
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where = type ? { type: type as any } : {};

    const sharedSections = await prisma.sharedSection.findMany({
      where,
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ sharedSections });
  } catch (error) {
    console.error('Error fetching shared sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared sections' },
      { status: 500 }
    );
  }
}

// POST /api/admin/shared-sections - создать новую общую секцию
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, data, description } = body;

    if (!name || !type || !data) {
      return NextResponse.json(
        { error: 'Name, type, and data are required' },
        { status: 400 }
      );
    }

    const sharedSection = await prisma.sharedSection.create({
      data: {
        name,
        type,
        data,
        description: description || null,
      }
    });

    return NextResponse.json({ sharedSection });
  } catch (error) {
    console.error('Error creating shared section:', error);
    return NextResponse.json(
      { error: 'Failed to create shared section' },
      { status: 500 }
    );
  }
}
