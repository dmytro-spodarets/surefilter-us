import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getActiveRedirects } from '@/lib/site-settings';

// Use Node.js runtime (stable in Next.js 15.5+) so we can access Prisma
// directly for DB-driven URL redirects. Edge runtime would require an HTTP
// fetch back to /api/redirects, which is an anti-pattern (Vercel/Next.js
// recommend Edge Config for that case, which is Vercel-only).
export const runtime = 'nodejs';

type RedirectRule = {
  source: string;
  destination: string;
  statusCode: 301 | 302;
  isActive: boolean;
};

function matchRedirect(pathname: string, rules: RedirectRule[]): RedirectRule | null {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  for (const r of rules) {
    if (!r.isActive) continue;
    const src = r.source.toLowerCase().replace(/\/+$/, '') || '/';
    if (src === normalized) return r;
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Work with a mutable Headers instance to allow normalization before passing downstream
  const requestHeaders = new Headers(req.headers);

  // Identify CloudFront -> origin requests by presence/value of header set in CloudFront origin config
  const headerFromCf = requestHeaders.get('x-origin-secret');
  const originSecret = process.env.ORIGIN_SECRET;
  const enforceOrigin = process.env.ENFORCE_ORIGIN === '1';

  // If we have an origin secret configured and the request is coming to the App Runner domain directly
  // (not through CloudFront), redirect to the canonical domain
  const host = requestHeaders.get('host') || '';
  const isAppRunnerDomain = host.includes('awsapprunner.com');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const isFromCloudFront = !!originSecret && headerFromCf === originSecret;

  // If request hits App Runner domain directly and is not coming via CloudFront (missing/invalid header),
  // redirect to the canonical domain to enforce viewer access only via CloudFront.
  if (enforceOrigin && isAppRunnerDomain && !isFromCloudFront && siteUrl) {
    const canonicalUrl = new URL(siteUrl);
    canonicalUrl.pathname = req.nextUrl.pathname;
    canonicalUrl.search = req.nextUrl.search;
    return NextResponse.redirect(canonicalUrl.toString(), 301);
  }

  // Note: non-canonical host redirect (www.surefilter.us, new.surefilter.us
  // → surefilter.us) is handled by CloudFront Function at viewer-request,
  // BEFORE cache lookup. See infra/envs/prod/cloudfront.tf → set_x_forwarded_host.

  // Admin authentication — protect admin pages and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      // API routes get 401, pages get redirected to login
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // URL redirects from SiteSettings.redirects (admin-editable).
  // Handled here (not in catch-all page) to avoid Next.js ISR prerender bug
  // that duplicates the Location header (vercel/next.js#82117).
  // Skip for admin/api/internal paths — they can't be redirect targets.
  const isInternalPath =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname === '/login';
  if (!isInternalPath) {
    let rules: RedirectRule[] = [];
    try {
      rules = (await getActiveRedirects()) as RedirectRule[];
    } catch (e) {
      // Fail open — if DB lookup fails, fall through without redirect
      console.error('[mw] getActiveRedirects failed:', e);
    }
    if (rules.length > 0) {
      const match = matchRedirect(pathname, rules);
      if (match) {
        const target = new URL(match.destination, req.nextUrl);
        // Preserve query string only for relative destinations — external
        // redirects keep whatever query they specify (or none).
        const isRelative = !/^https?:\/\//i.test(match.destination);
        if (isRelative && req.nextUrl.search) {
          target.search = req.nextUrl.search;
        }
        return NextResponse.redirect(target, match.statusCode);
      }
    }
  }

  // Preserve CloudFront-provided x-forwarded-host (viewer Host) for Server Actions origin validation.
  // Only set it from Host when missing (e.g., local dev), do NOT overwrite a valid CF value.
  const xfh = requestHeaders.get('x-forwarded-host');
  if (!xfh && host) {
    requestHeaders.set('x-forwarded-host', host);
    requestHeaders.set('x-mw-normalized', 'set-from-host');
  } else if (xfh) {
    requestHeaders.set('x-mw-normalized', 'pass');
  } else {
    requestHeaders.set('x-mw-normalized', 'none');
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
