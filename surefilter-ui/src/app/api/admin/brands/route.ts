import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";

// Using shared prisma instance from lib/prisma

// Validation schema
const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers').optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  website: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/brands - List all brands
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get brands with product count
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy: [
          { position: 'asc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      prisma.brand.count({ where }),
    ]);

    return NextResponse.json({
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/brands - Create new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = brandSchema.parse(body);

    // Check if name already exists
    const existingName = await prisma.brand.findUnique({
      where: { name: validatedData.name },
    });

    if (existingName) {
      return NextResponse.json(
        { error: 'A brand with this name already exists' },
        { status: 400 }
      );
    }

    // Check if code already exists (if provided)
    if (validatedData.code) {
      const existingCode = await prisma.brand.findUnique({
        where: { code: validatedData.code },
      });

      if (existingCode) {
        return NextResponse.json(
          { error: 'A brand with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        ...validatedData,
        code: validatedData.code || null,
        description: validatedData.description || null,
        logoUrl: validatedData.logoUrl || null,
        website: validatedData.website || null,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    console.error('Error creating brand:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create brand', details: error.message },
      { status: 500 }
    );
  }
}
