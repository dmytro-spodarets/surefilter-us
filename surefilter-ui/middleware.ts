import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Enforce canonical domain via CloudFront: only allow requests carrying origin secret header
  const originSecret = process.env.ORIGIN_SECRET;
  const headerFromCf = req.headers.get('x-origin-secret');
  
  // Get the actual host from headers (CloudFront forwards this)
  const hostHeader = req.headers.get('host') || req.headers.get('x-forwarded-host');
  const siteHostRaw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '');
  const host = hostHeader?.toLowerCase();
  const siteHost = siteHostRaw?.toLowerCase();
  
  // If origin secret is configured and request doesn't have it or it's wrong, 
  // AND we're not on the canonical domain, redirect to canonical
  if (originSecret && headerFromCf !== originSecret) {
    // Request is not from CloudFront, check if we need to redirect
    if (siteHost && host && host !== siteHost) {
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


