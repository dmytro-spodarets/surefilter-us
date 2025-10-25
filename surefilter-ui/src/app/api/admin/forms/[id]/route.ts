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

const UpdateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema).optional(),
  successTitle: z.string().optional(),
  successMessage: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal('')).nullable(),
  webhookUrl: z.string().url().optional().or(z.literal('')).nullable(),
  webhookHeaders: z.record(z.string(), z.string()).optional().nullable(),
  notifyEmail: z.string().email().optional().or(z.literal('')).nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/forms/[id] - Get single form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            submissions: true,
            resources: true,
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/forms/[id] - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateFormSchema.parse(body);

    // Check if form exists
    const existing = await prisma.form.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.form.findFirst({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Form with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Clean up empty optional fields
    const cleanData: any = { ...data };
    if (data.redirectUrl === '') cleanData.redirectUrl = null;
    if (data.webhookUrl === '') cleanData.webhookUrl = null;
    if (data.notifyEmail === '') cleanData.notifyEmail = null;

    const form = await prisma.form.update({
      where: { id },
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

    return NextResponse.json(form);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/forms/[id] - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if form exists
    const existing = await prisma.form.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            submissions: true,
            resources: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Check if form is being used by resources
    if (existing._count.resources > 0) {
      return NextResponse.json(
        { error: `Cannot delete form. It is being used by ${existing._count.resources} resource(s)` },
        { status: 400 }
      );
    }

    // Delete form (submissions will be cascade deleted)
    await prisma.form.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}

