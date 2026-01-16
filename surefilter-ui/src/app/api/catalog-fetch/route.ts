import { NextRequest } from 'next/server';
import { fetchAndParseCatalog } from '@/lib/catalog-parser';

export async function GET(request: NextRequest) {
  const catalogUrl = request.nextUrl.searchParams.get('url');
  
  if (!catalogUrl) {
    return Response.json({ error: 'Missing URL parameter' }, { status: 400 });
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
      { 
        error: 'Error fetching catalog', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
