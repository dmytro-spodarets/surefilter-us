import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Key public pages to warm up after deployment.
// ISR caches build-time empty renders; this forces re-render with real DB data.
const WARM_UP_PATHS = [
  '/',
  '/about-us',
  '/contact-us',
  '/warranty',
  '/heavy-duty',
  '/automotive',
  '/industries',
  '/newsroom',
  '/resources',
];

export async function GET(request: Request) {
  // Only allow from localhost (Docker healthcheck / startup script)
  const host = request.headers.get('host') ?? '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  for (const p of WARM_UP_PATHS) {
    revalidatePath(p, 'page');
  }

  return NextResponse.json({ revalidated: WARM_UP_PATHS });
}
