import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { purgeExpiredIdempotency } from '@/lib/idempotency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Periodic MCP-server housekeeping:
 *   1. Soft-revoke ApiTokens whose `expiresAt` has passed (`revokedReason='EXPIRED'`).
 *   2. Purge MCPIdempotency rows older than 24h.
 *
 * Designed to be run from an external scheduler (App Runner cron container,
 * EventBridge → ALB hit, GitHub Actions, etc.) — auth is by `CRON_SECRET`
 * env var (Authorization: Bearer <secret>) OR a same-origin localhost call
 * (mirrors the /api/warm-up convention).
 *
 * Returns a small JSON summary so the caller can spot anomalies.
 */
function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // No secret configured — only allow localhost
    const host = req.headers.get('host') || '';
    return host.startsWith('localhost') || host.startsWith('127.0.0.1');
  }
  const header = req.headers.get('authorization');
  if (!header) return false;
  const [scheme, value] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && value === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return run();
}

// Allow GET too so a simple curl from a cron container without -X works.
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return run();
}

async function run() {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // 1. Auto-revoke expired tokens
  const expired = await prisma.apiToken.findMany({
    where: {
      revokedAt: null,
      expiresAt: { not: null, lt: now },
    },
    select: { id: true, name: true, tokenPrefix: true, userId: true, expiresAt: true },
  });
  for (const t of expired) {
    await prisma.apiToken.update({
      where: { id: t.id },
      data: { revokedAt: now, revokedReason: 'EXPIRED' },
    });
    // Best-effort audit
    if (t.userId) {
      try {
        await prisma.adminLog.create({
          data: {
            userId: t.userId,
            action: 'TOKEN_REVOKED',
            entityType: 'ApiToken',
            entityId: t.id,
            entityName: t.name,
            details: { reason: 'EXPIRED', tokenPrefix: t.tokenPrefix, source: 'cron:mcp-cleanup' } as any,
          },
        });
      } catch (e) {
        console.error('[cron/mcp-cleanup] audit log failed for expired token', t.id, e);
      }
    }
  }

  // 2. Flag inactive tokens (>90d) — surface in the response so admins can act.
  // We do NOT auto-revoke these — only surface them.
  const inactive = await prisma.apiToken.findMany({
    where: {
      revokedAt: null,
      OR: [
        { lastUsedAt: { lt: ninetyDaysAgo } },
        { lastUsedAt: null, createdAt: { lt: ninetyDaysAgo } },
      ],
    },
    select: { id: true, name: true, tokenPrefix: true, lastUsedAt: true, createdAt: true },
  });

  // 3. Purge idempotency rows older than 24h
  const idemPurged = await purgeExpiredIdempotency();

  return NextResponse.json({
    ok: true,
    ranAt: now.toISOString(),
    expiredRevoked: expired.length,
    expiredTokens: expired.map((t) => ({ id: t.id, name: t.name, expiresAt: t.expiresAt })),
    inactiveCount: inactive.length,
    inactiveTokens: inactive.map((t) => ({ id: t.id, name: t.name, lastUsedAt: t.lastUsedAt, createdAt: t.createdAt })),
    idempotencyPurged: idemPurged,
  });
}
