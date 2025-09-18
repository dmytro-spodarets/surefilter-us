import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies as cookieStore } from 'next/headers';

function parseAllowedOriginsFromEnv(envVal?: string | null): string[] {
  if (!envVal) return [];
  return envVal
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const headers = request.headers;

  // Capture a safe subset of headers
  const lower = (s: string) => s.toLowerCase();
  const wanted = new Set<string>([
    'host',
    'x-forwarded-host',
    'x-original-forwarded-host',
    'x-mw-normalized',
    'origin',
    'referer',
    'x-forwarded-proto',
    'x-forwarded-port',
    'content-type',
    'content-length',
    'user-agent',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-dest',
    'next-action',
    'next-router-state-tree',
    'next-url',
    'rsc',
    'x-origin-secret',
  ]);
  const safeHeaderEntries: Record<string, string | boolean | null> = {};
  for (const [k, v] of headers.entries()) {
    const lk = lower(k);
    if (wanted.has(lk)) {
      if (lk === 'x-origin-secret') {
        safeHeaderEntries[k] = v ? true : false;
      } else {
        safeHeaderEntries[k] = v;
      }
    }
    if (lk.startsWith('next-') || lk.startsWith('x-next-') || lk === 'rsc') {
      safeHeaderEntries[k] = headers.get(k);
    }
  }

  // Cookies: names only
  const cookieNames: string[] = [];
  try {
    const csAny = cookieStore() as any;
    const all = csAny?.getAll?.() ?? [];
    for (const c of all as Array<{ name: string }>) cookieNames.push(c.name);
  } catch {}

  const host = headers.get('host') || null;
  const xForwardedHost = headers.get('x-forwarded-host') || null;
  const xOriginalForwardedHost = headers.get('x-original-forwarded-host') || null;
  const xMwNormalized = headers.get('x-mw-normalized') || null;
  const xCfFn = headers.get('x-cf-fn') || null;
  const origin = headers.get('origin') || null;
  const referer = headers.get('referer') || null;
  const xForwardedProto = headers.get('x-forwarded-proto') || null;
  const xForwardedPort = headers.get('x-forwarded-port') || null;

  const env = {
    NODE_ENV: process.env.NODE_ENV || null,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    ENFORCE_ORIGIN: process.env.ENFORCE_ORIGIN || null,
    NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS: process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS || null,
  } as const;

  const effectiveAllowedOrigins = computeEffectiveAllowedOrigins(env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS);

  return NextResponse.json({
    request: {
      url: url.toString(),
      method: request.method,
    },
    headers: {
      host,
      'x-forwarded-host': xForwardedHost,
      'x-original-forwarded-host': xOriginalForwardedHost,
      'x-cf-fn': xCfFn,
      origin,
      referer,
      'x-forwarded-proto': xForwardedProto,
      'x-forwarded-port': xForwardedPort,
      'x-mw-normalized': xMwNormalized,
    },
    allSafeHeaders: safeHeaderEntries,
    cookies: { names: cookieNames, count: cookieNames.length },
    server: env,
    derived: {
      effectiveAllowedOrigins,
      originMismatch: origin && xForwardedHost ? origin.includes(host || '') === false || (xForwardedHost !== host) : null,
      isServerActionLike: !!headers.get('next-action'),
      viaCloudFront: xForwardedHost && host ? xForwardedHost !== host : null,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const headers = request.headers;

  // Capture a safe subset of headers for debugging (avoid leaking sensitive values)
  const lower = (s: string) => s.toLowerCase();
  const wanted = new Set<string>([
    'host',
    'x-forwarded-host',
    'x-original-forwarded-host',
    'x-mw-normalized',
    'origin',
    'referer',
    'x-forwarded-proto',
    'x-forwarded-port',
    'content-type',
    'content-length',
    'user-agent',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-dest',
    'next-action',
    'next-router-state-tree',
    'next-url',
    'rsc',
    'x-origin-secret', // will report presence only, not the actual value
  ]);
  const safeHeaderEntries: Record<string, string | boolean | null> = {};
  for (const [k, v] of headers.entries()) {
    const lk = lower(k);
    if (wanted.has(lk)) {
      if (lk === 'x-origin-secret') {
        safeHeaderEntries[k] = v ? true : false;
      } else {
        safeHeaderEntries[k] = v;
      }
    }
    // additionally include any header starting with these prefixes
    if (lk.startsWith('next-') || lk.startsWith('x-next-') || lk === 'rsc') {
      safeHeaderEntries[k] = headers.get(k);
    }
  }

  // Cookies: list names only
  const cookieNames: string[] = [];
  try {
    const csAny = cookieStore() as any;
    const all = csAny?.getAll?.() ?? [];
    for (const c of all as Array<{ name: string }>) cookieNames.push(c.name);
  } catch {}

  const host = headers.get('host') || null;
  const xForwardedHost = headers.get('x-forwarded-host') || null;
  const xOriginalForwardedHost = headers.get('x-original-forwarded-host') || null;
  const xMwNormalized = headers.get('x-mw-normalized') || null;
  const xCfFn = headers.get('x-cf-fn') || null;
  const origin = headers.get('origin') || null;
  const referer = headers.get('referer') || null;
  const xForwardedProto = headers.get('x-forwarded-proto') || null;
  const xForwardedPort = headers.get('x-forwarded-port') || null;

  const env = {
    NODE_ENV: process.env.NODE_ENV || null,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    ENFORCE_ORIGIN: process.env.ENFORCE_ORIGIN || null,
    NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS: process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS || null,
  } as const;

  const effectiveAllowedOrigins = computeEffectiveAllowedOrigins(env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS);

  return NextResponse.json({
    request: {
      url: url.toString(),
      method: request.method,
    },
    headers: {
      host,
      'x-forwarded-host': xForwardedHost,
      'x-original-forwarded-host': xOriginalForwardedHost,
      'x-cf-fn': xCfFn,
      origin,
      referer,
      'x-forwarded-proto': xForwardedProto,
      'x-forwarded-port': xForwardedPort,
      'x-mw-normalized': xMwNormalized,
    },
    allSafeHeaders: safeHeaderEntries,
    cookies: { names: cookieNames, count: cookieNames.length },
    server: env,
    derived: {
      effectiveAllowedOrigins,
      originMismatch: origin && xForwardedHost ? origin.includes(host || '') === false || (xForwardedHost !== host) : null,
      isServerActionLike: !!(headers.get('next-action') || (request.method === 'POST' && (headers.get('content-type') || '').includes('multipart/form-data'))),
      viaCloudFront: xForwardedHost && host ? xForwardedHost !== host : null,
    },
    timestamp: new Date().toISOString(),
  });
}

function computeEffectiveAllowedOrigins(envVal?: string | null): string[] {
  const fromEnv = parseAllowedOriginsFromEnv(envVal);
  if (fromEnv.length) return fromEnv;
  // Fallback that mirrors next.config.ts default
  return [
    'new.surefilter.us',
    'qiypwsyuxm.us-east-1.awsapprunner.com',
    'https://new.surefilter.us',
    'https://qiypwsyuxm.us-east-1.awsapprunner.com',
  ];
}
