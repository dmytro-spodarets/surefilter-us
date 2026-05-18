import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Look up an existing idempotency record. Returns the stored response if the
 * (tokenId, key) tuple was recorded within the last 24h, or null otherwise.
 *
 * Records older than the TTL are treated as expired (and pruned lazily on
 * the next cron sweep — see /api/cron/mcp-cleanup).
 */
export async function readIdempotency(tokenId: string, key: string): Promise<unknown | null> {
  const row = await prisma.mCPIdempotency.findUnique({
    where: { tokenId_key: { tokenId, key } },
    select: { response: true, createdAt: true },
  });
  if (!row) return null;
  if (Date.now() - row.createdAt.getTime() > IDEMPOTENCY_TTL_MS) return null;
  return row.response;
}

/**
 * Persist the response for a (tokenId, key) tuple. Best-effort — failures
 * are logged but do not propagate, since the underlying mutation has already
 * succeeded and the worst case is that the agent re-runs it on retry.
 */
export async function writeIdempotency(opts: {
  tokenId: string;
  key: string;
  tool: string;
  response: unknown;
}): Promise<void> {
  try {
    await prisma.mCPIdempotency.upsert({
      where: { tokenId_key: { tokenId: opts.tokenId, key: opts.key } },
      create: {
        tokenId: opts.tokenId,
        key: opts.key,
        tool: opts.tool,
        response: opts.response as Prisma.InputJsonValue,
      },
      update: {
        tool: opts.tool,
        response: opts.response as Prisma.InputJsonValue,
        createdAt: new Date(),
      },
    });
  } catch (e) {
    console.error('[mcp/idempotency] writeIdempotency failed:', e);
  }
}

/**
 * Purge idempotency rows older than the TTL. Called by the cron.
 * Returns the number of rows deleted.
 */
export async function purgeExpiredIdempotency(): Promise<number> {
  const cutoff = new Date(Date.now() - IDEMPOTENCY_TTL_MS);
  const r = await prisma.mCPIdempotency.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return r.count;
}
