import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function parseAllowedOriginsFromEnv(envVal?: string | null): string[] {
  if (!envVal) return [];
  return envVal
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
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

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const headers = request.headers;

  const host = headers.get('host') || null;
  const xForwardedHost = headers.get('x-forwarded-host') || null;
  const xOriginalForwardedHost = headers.get('x-original-forwarded-host') || null;
  const xMwNormalized = headers.get('x-mw-normalized') || null;
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
      origin,
      referer,
      'x-forwarded-proto': xForwardedProto,
      'x-forwarded-port': xForwardedPort,
      'x-mw-normalized': xMwNormalized,
    },
    server: env,
    derived: {
      effectiveAllowedOrigins,
      originMismatch: origin && xForwardedHost ? origin.includes(host || '') === false || (xForwardedHost !== host) : null,
    },
    timestamp: new Date().toISOString(),
  });
}
