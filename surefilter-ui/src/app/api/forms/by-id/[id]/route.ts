import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/forms/by-id/[id] - Get form configuration by ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const form = await prisma.form.findUnique({
      where: { 
        id,
        isActive: true, // Only return active forms
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        fields: true,
        successTitle: true,
        successMessage: true,
        redirectUrl: true,
        // Don't expose webhook/email settings to public
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

