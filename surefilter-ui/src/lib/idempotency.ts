import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PENDING_SENTINEL = { _idempotency: 'pending' as const };

export type IdempotencyClaim =
  | { kind: 'cached'; response: unknown }
  | { kind: 'claimed' }
  | { kind: 'in-progress'; sinceMs: number };

/**
 * Atomically claim an idempotency slot for (tokenId, key).
 *
 *   - 'cached'        — a prior call completed and the stored response is returned.
 *   - 'claimed'       — we own the slot; caller must execute the mutation and
 *                       then call finalizeIdempotency() to persist the real result.
 *   - 'in-progress'   — another concurrent caller is mid-mutation (placeholder row
 *                       within TTL). Caller should return a 409-style error so the
 *                       client retries instead of double-executing.
 *
 * The implementation relies on the (tokenId, key) unique constraint:
 *   1. Try `prisma.mCPIdempotency.create({ response: PENDING_SENTINEL })`.
 *      Success → we won the race, return 'claimed'.
 *      Failure (unique violation) → another worker beat us. Read the row.
 *   2. If existing row's response is the PENDING_SENTINEL and within TTL,
 *      return 'in-progress' so the caller can ask the client to retry.
 *   3. If existing row has a real response within TTL → 'cached'.
 *   4. If existing row is past TTL, overwrite via upsert and return 'claimed'.
 */
export async function claimIdempotency(tokenId: string, key: string, tool: string): Promise<IdempotencyClaim> {
  try {
    await prisma.mCPIdempotency.create({
      data: {
        tokenId, key, tool,
        response: PENDING_SENTINEL as unknown as Prisma.InputJsonValue,
      },
    });
    return { kind: 'claimed' };
  } catch (e: any) {
    if (e?.code !== 'P2002') {
      // Unexpected DB error — let the caller proceed without dedup rather than block the mutation.
      console.error('[mcp/idempotency] claim insert failed:', e);
      return { kind: 'claimed' };
    }
    // Unique violation — another worker has the slot. Inspect it.
  }

  const existing = await prisma.mCPIdempotency.findUnique({
    where: { tokenId_key: { tokenId, key } },
    select: { id: true, response: true, createdAt: true },
  });
  if (!existing) {
    // Race within a race — the other worker rolled back. Try one more claim.
    try {
      await prisma.mCPIdempotency.create({
        data: { tokenId, key, tool, response: PENDING_SENTINEL as unknown as Prisma.InputJsonValue },
      });
      return { kind: 'claimed' };
    } catch {
      return { kind: 'claimed' }; // give up on dedup
    }
  }

  const ageMs = Date.now() - existing.createdAt.getTime();
  const isPending = isPendingSentinel(existing.response);

  if (ageMs > IDEMPOTENCY_TTL_MS) {
    // Stale slot — reclaim it.
    await prisma.mCPIdempotency.update({
      where: { id: existing.id },
      data: { tool, response: PENDING_SENTINEL as unknown as Prisma.InputJsonValue, createdAt: new Date() },
    });
    return { kind: 'claimed' };
  }

  if (isPending) {
    return { kind: 'in-progress', sinceMs: ageMs };
  }

  return { kind: 'cached', response: existing.response };
}

/**
 * Finalize an idempotency slot by replacing the pending placeholder with the
 * real response. Called by the tool handler after it successfully executes
 * the mutation.
 */
export async function finalizeIdempotency(opts: {
  tokenId: string;
  key: string;
  tool: string;
  response: unknown;
}): Promise<void> {
  try {
    await prisma.mCPIdempotency.update({
      where: { tokenId_key: { tokenId: opts.tokenId, key: opts.key } },
      data: { tool: opts.tool, response: opts.response as Prisma.InputJsonValue },
    });
  } catch (e) {
    console.error('[mcp/idempotency] finalize failed:', e);
  }
}

/** Drop the placeholder if the mutation threw — frees the slot for retry. */
export async function releaseIdempotency(tokenId: string, key: string): Promise<void> {
  try {
    await prisma.mCPIdempotency.delete({
      where: { tokenId_key: { tokenId, key } },
    });
  } catch (e: any) {
    if (e?.code !== 'P2025') console.error('[mcp/idempotency] release failed:', e);
  }
}

function isPendingSentinel(response: unknown): boolean {
  return (
    response !== null &&
    typeof response === 'object' &&
    (response as Record<string, unknown>)._idempotency === 'pending'
  );
}

/**
 * @deprecated Use claimIdempotency() + finalizeIdempotency() so concurrent
 *             retries don't both execute the mutation. Kept for the cron purge
 *             and for any read-only inspection.
 */
export async function readIdempotency(tokenId: string, key: string): Promise<unknown | null> {
  const row = await prisma.mCPIdempotency.findUnique({
    where: { tokenId_key: { tokenId, key } },
    select: { response: true, createdAt: true },
  });
  if (!row) return null;
  if (Date.now() - row.createdAt.getTime() > IDEMPOTENCY_TTL_MS) return null;
  if (isPendingSentinel(row.response)) return null;
  return row.response;
}

/**
 * @deprecated kept for tools still on the old API. Prefer claim/finalize.
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
        tokenId: opts.tokenId, key: opts.key, tool: opts.tool,
        response: opts.response as Prisma.InputJsonValue,
      },
      update: { tool: opts.tool, response: opts.response as Prisma.InputJsonValue, createdAt: new Date() },
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
