import { NextResponse } from 'next/server';
import { getActiveRedirects } from '@/lib/site-settings';

export async function GET() {
  try {
    const redirects = await getActiveRedirects();
    return NextResponse.json(redirects, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}
