import { NextRequest } from 'next/server';
import { fetchAndParseCatalog } from '@/lib/catalog-parser';
import { validateFetchUrl } from '@/lib/url-validator';
import { publicApiLimiter, getClientIp } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = publicApiLimiter.check(`catalog-fetch:${ip}`);
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const rawUrl = request.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return Response.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  const catalogUrl = validateFetchUrl(rawUrl);
  if (!catalogUrl) {
    return Response.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const catalogData = await fetchAndParseCatalog(catalogUrl);

    return Response.json(catalogData, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });

  } catch (error) {
    console.error('Catalog fetch error:', error);
    return Response.json(
      { error: 'Error fetching catalog' },
      { status: 500 }
    );
  }
}
