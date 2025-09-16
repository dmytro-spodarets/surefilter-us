import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;

  // Enforce canonical domain via CloudFront: only allow requests carrying origin secret header
  const originSecret = process.env.ORIGIN_SECRET;
  const headerFromCf = req.headers.get('x-origin-secret');
  const siteHostRaw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '');
  const host = hostname.toLowerCase();
  const siteHost = siteHostRaw?.toLowerCase();
  const isAppRunnerHost = host.endsWith('.awsapprunner.com');

  // Always redirect direct App Runner access to canonical domain
  if (isAppRunnerHost && siteHost && host !== siteHost) {
    return NextResponse.redirect(`https://${siteHost}${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }

  // If request to non-canonical host and missing/mismatched origin secret, redirect to canonical
  if (siteHost && host !== siteHost) {
    if (!originSecret || !headerFromCf || headerFromCf !== originSecret) {
      return NextResponse.redirect(`https://${siteHost}${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
    }
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


