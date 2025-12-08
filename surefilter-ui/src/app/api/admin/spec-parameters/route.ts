import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";

// Using shared prisma instance from lib/prisma

// Validation schema
const specParameterSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/, 'Code must contain only uppercase letters, numbers, and underscores').optional().nullable(),
  name: z.string().min(1, 'Name is required').max(100),
  unit: z.string().max(20).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/spec-parameters - List all spec parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get parameters with value count
    const [parameters, total] = await Promise.all([
      prisma.specParameter.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { position: 'asc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              values: true,
            },
          },
        },
      }),
      prisma.specParameter.count({ where }),
    ]);

    // Get unique categories
    const categories = await prisma.specParameter.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({
      parameters,
      categories: categories.map(c => c.category).filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching spec parameters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spec parameters', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/spec-parameters - Create new spec parameter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = specParameterSchema.parse(body);

    // Check if code already exists (if provided)
    if (validatedData.code) {
      const existingCode = await prisma.specParameter.findUnique({
        where: { code: validatedData.code },
      });

      if (existingCode) {
        return NextResponse.json(
          { error: 'A parameter with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Create parameter
    const parameter = await prisma.specParameter.create({
      data: {
        code: validatedData.code || null,
        name: validatedData.name,
        unit: validatedData.unit || null,
        category: validatedData.category || null,
        position: validatedData.position,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(parameter, { status: 201 });
  } catch (error: any) {
    console.error('Error creating spec parameter:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create spec parameter', details: error.message },
      { status: 500 }
    );
  }
}
