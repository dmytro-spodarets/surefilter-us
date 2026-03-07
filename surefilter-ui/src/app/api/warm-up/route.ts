import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Key public pages to warm up after deployment.
// ISR caches build-time empty renders; this forces re-render with real DB data.
const WARM_UP_PATHS = [
  '/',
  '/about-us',
  '/contact-us',
  '/warranty',
  '/privacy-policy',
  '/terms',
  // Heavy Duty
  '/heavy-duty',
  '/heavy-duty/air-filters',
  '/heavy-duty/oil-filters',
  '/heavy-duty/fuel-filters',
  '/heavy-duty/cabin-filters',
  '/heavy-duty/hydraulic-filters',
  '/heavy-duty/transmission-filters',
  '/heavy-duty/separator-filters',
  // Automotive
  '/automotive',
  '/automotive/air-filters',
  '/automotive/oil-filters',
  '/automotive/fuel-filters',
  '/automotive/cabin-filters',
  // Industries
  '/industries',
  '/industries/agriculture',
  '/industries/automotive',
  '/industries/construction',
  '/industries/heavy-duty-truck',
  '/industries/industrial-equipment',
  '/industries/marine',
  // Catalog & Content
  '/catalog',
  '/newsroom',
  '/resources',
];

export async function GET(request: Request) {
  // Only allow from localhost (Docker healthcheck / startup script)
  const host = request.headers.get('host') ?? '';
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  if (!isLocal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  for (const p of WARM_UP_PATHS) {
    revalidatePath(p, 'page');
  }

  return NextResponse.json({ revalidated: WARM_UP_PATHS });
}
