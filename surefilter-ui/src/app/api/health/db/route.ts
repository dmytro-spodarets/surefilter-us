import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DB healthcheck failed:', error);
    return NextResponse.json(
      { ok: false, error: 'DB connection failed' },
      { status: 500 }
    );
  }
}


