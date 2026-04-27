import { NextResponse } from 'next/server';
import { getActiveBanners } from '@/lib/banners';

export const dynamic = 'force-dynamic';

export async function GET() {
  const banners = await getActiveBanners();
  return NextResponse.json({ banners });
}
