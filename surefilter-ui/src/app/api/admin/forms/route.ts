import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for form fields
const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  helpText: z.string().optional(),
  width: z.enum(['full', 'half']).default('full'),
  options: z.array(z.string()).optional(), // For select, radio, checkbox
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

const CreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  successTitle: z.string().optional(),
  successMessage: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal('')),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  webhookHeaders: z.record(z.string(), z.string()).optional(),
  notifyEmail: z.string().email().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

// GET /api/admin/forms - List all forms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const forms = await prisma.form.findMany({
      where,
      include: {
        _count: {
          select: {
            submissions: true,
            resources: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST /api/admin/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateFormSchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.form.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Form with this slug already exists' },
        { status: 400 }
      );
    }

    // Clean up empty optional fields
    const cleanData: any = {
      ...data,
      redirectUrl: data.redirectUrl || null,
      webhookUrl: data.webhookUrl || null,
      notifyEmail: data.notifyEmail || null,
      webhookHeaders: data.webhookHeaders || null,
    };

    const form = await prisma.form.create({
      data: cleanData,
      include: {
        _count: {
          select: {
            submissions: true,
            resources: true,
          },
        },
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}

