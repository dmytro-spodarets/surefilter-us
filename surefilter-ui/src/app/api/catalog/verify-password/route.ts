import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { timingSafeEqual } from 'crypto';
import { passwordLimiter, getClientIp } from '@/lib/rate-limiter';

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// POST /api/catalog/verify-password - Verify catalog password
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = passwordLimiter.check(`catalog:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    if (!settings.catalogPasswordEnabled) {
      return NextResponse.json({ success: true });
    }

    if (settings.catalogPassword && safeCompare(password, settings.catalogPassword)) {
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
