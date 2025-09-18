import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  
  const isFromCloudFront = !!headerFromCf && (!originSecret || headerFromCf === originSecret);

  // If request hits App Runner domain directly and is not coming via CloudFront (missing/invalid header),
  // redirect to the canonical domain to enforce viewer access only via CloudFront.
  if (enforceOrigin && isAppRunnerDomain && !isFromCloudFront && siteUrl) {
    const canonicalUrl = new URL(siteUrl);
    canonicalUrl.pathname = req.nextUrl.pathname;
    canonicalUrl.search = req.nextUrl.search;
    return NextResponse.redirect(canonicalUrl.toString(), 301);
  }

  // Admin authentication
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Normalize x-forwarded-host to the viewer Host so Next.js Server Actions origin checks pass behind CDN/proxy
  const xfh = requestHeaders.get('x-forwarded-host');
  if (host && xfh !== host) {
    // Preserve original for debugging
    if (xfh) {
      requestHeaders.set('x-original-forwarded-host', xfh);
    }
    requestHeaders.set('x-forwarded-host', host);
    requestHeaders.set('x-mw-normalized', '1');
  } else {
    requestHeaders.set('x-mw-normalized', '0');
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/:path*'],
};


