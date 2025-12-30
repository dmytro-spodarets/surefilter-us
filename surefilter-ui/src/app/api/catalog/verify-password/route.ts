import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/catalog/verify-password - Verify catalog password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get settings
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    // Check if password protection is enabled
    if (!settings.catalogPasswordEnabled) {
      return NextResponse.json({ success: true });
    }

    // Verify password
    if (password === settings.catalogPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying catalog password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}

// GET /api/catalog/verify-password - Check if password protection is enabled
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ enabled: false });
    }

    return NextResponse.json({ 
      enabled: settings.catalogPasswordEnabled || false 
    });
  } catch (error) {
    console.error('Error checking catalog password status:', error);
    return NextResponse.json(
      { error: 'Failed to check password status' },
      { status: 500 }
    );
  }
}
