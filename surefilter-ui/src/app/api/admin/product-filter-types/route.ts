import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/admin/product-filter-types - List all filter types
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filterTypes = await prisma.productFilterType.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(filterTypes);
  } catch (error) {
    console.error('Error fetching product filter types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product filter types' },
      { status: 500 }
    );
  }
}

// POST /api/admin/product-filter-types - Create new filter type
const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  position: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const filterType = await prisma.productFilterType.create({
      data,
    });

    return NextResponse.json(filterType, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating product filter type:', error);
    return NextResponse.json(
      { error: 'Failed to create product filter type' },
      { status: 500 }
    );
  }
}
