import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Identify CloudFront -> origin requests by presence/value of header set in CloudFront origin config
  const headerFromCf = req.headers.get('x-origin-secret');
  const originSecret = process.env.ORIGIN_SECRET;
  
  // If we have an origin secret configured and the request is coming to the App Runner domain directly
  // (not through CloudFront), redirect to the canonical domain
  const host = req.headers.get('host') || '';
  const isAppRunnerDomain = host.includes('awsapprunner.com');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  const isFromCloudFront = !!headerFromCf && (!originSecret || headerFromCf === originSecret);

  // If request hits App Runner domain directly and is not coming via CloudFront (missing/invalid header),
  // redirect to the canonical domain to enforce viewer access only via CloudFront.
  if (isAppRunnerDomain && !isFromCloudFront && siteUrl) {
    const canonicalUrl = new URL(siteUrl);
    canonicalUrl.pathname = req.nextUrl.pathname;
    canonicalUrl.search = req.nextUrl.search;
    return NextResponse.redirect(canonicalUrl.toString(), 301);
  }
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};


