import { NextRequest, NextResponse } from 'next/server';
import { validateFetchUrl } from '@/lib/url-validator';

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  const url = validateFetchUrl(rawUrl);
  if (!url) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SureFilterBot/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 });
    }

    const fileData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/pdf';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': siteUrl,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': siteUrl,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
