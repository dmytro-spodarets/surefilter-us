import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { invalidatePages } from '@/lib/revalidate';
import { hasScope } from '@/lib/api-token';
import { forbidden } from '@/mcp/scope-guard';
import { logToolCall } from '@/mcp/audit';
import { readIdempotency, writeIdempotency } from '@/lib/idempotency';
import type { Prisma, AdminAction } from '@/generated/prisma';
import type { AuthCtx } from '@/mcp/tools/_helpers';
import { errorResult } from '@/mcp/tools/_helpers';

/** Zod field every mutating tool MUST accept. */
export const mutationCommonFields = {
  confirm: z.boolean().optional().describe('Required `true` for destructive operations (delete, publish, settings/users writes).'),
  idempotencyKey: z.string().min(1).max(200).optional().describe(
    'Optional client-supplied dedupe key. Tools that wrap their body in `withIdempotency(...)` will, ' +
    'when the same (token, key) tuple is replayed within 24h, return the original response without re-running ' +
    'the mutation. Tools that have not opted in accept the field but ignore it; see scripts/lib/idempotency.ts.'
  ),
};

/**
 * Idempotency wrapper for mutating tools. Pattern:
 *
 *   return withIdempotency(ctx, args.idempotencyKey, 'my-tool', async () => {
 *     // ...do the mutation, build the MCP result...
 *     return jsonResult({ ... });
 *   });
 *
 * If `idempotencyKey` is provided AND the (tokenId, key) tuple was seen
 * within the last 24h, returns the stored result without invoking `fn`.
 * Otherwise runs `fn`, stores the result, and returns it.
 *
 * Anonymous callers (no tokenId) skip the cache — idempotency requires a
 * persistent identity to scope keys.
 */
export async function withIdempotency<T>(
  ctx: AuthCtx,
  key: string | undefined,
  tool: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!key || !ctx.tokenId) return fn();
  const cached = await readIdempotency(ctx.tokenId, key);
  if (cached !== null) return cached as T;
  const result = await fn();
  await writeIdempotency({ tokenId: ctx.tokenId, key, tool, response: result });
  return result;
}

/**
 * Enforce write scope OR admin:*. Writes never have a public-mode fallback —
 * anonymous callers are always denied. Also writes a `forbidden` audit entry.
 */
export async function requireWriteScope(
  ctx: AuthCtx,
  scope: string,
  tool: string,
  params?: Record<string, unknown>
) {
  if (hasScope(ctx.scopes, scope)) return null;
  await logToolCall({
    tool, scopes: ctx.scopes, status: 'forbidden',
    clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip,
    params,
  });
  return forbidden(`Requires ${scope}`);
}

/**
 * Destructive operations require an explicit `confirm: true`.
 * Returns null on success, or a structured MCP "needs confirmation" result so the
 * caller can re-invoke with confirm=true. Each tool that needs this guard wraps
 * the destructive path with `if (await requireConfirm(...)) return result;`
 */
export function requireConfirm(args: { confirm?: boolean }, action: string, target: string) {
  if (args.confirm === true) return null;
  return errorResult(
    `Destructive operation "${action}" on ${target} requires confirmation. ` +
    'Re-invoke with `confirm: true` in the input to proceed.'
  );
}

/**
 * Write one audit entry on the affected entity (CREATE / UPDATE / DELETE) AND
 * one MCP_TOOL_CALL entry attributing the action to the API token. Mirrors the
 * pattern used by /admin/* web routes so /admin/logs continues to show a
 * unified view regardless of how the change came in.
 */
export async function auditMutation(opts: {
  ctx: AuthCtx;
  tool: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  entityName: string;
  details?: Record<string, unknown>;
  /** Optional human-readable summary of the mutation for usage dashboards. */
  resultSummary?: string;
  params?: Record<string, unknown>;
}) {
  if (opts.ctx.userId) {
    try {
      await prisma.adminLog.create({
        data: {
          userId: opts.ctx.userId,
          action: opts.action as AdminAction,
          entityType: opts.entityType,
          entityId: opts.entityId,
          entityName: opts.entityName,
          details: {
            ...(opts.details ?? {}),
            source: 'mcp',
            tool: opts.tool,
            tokenId: opts.ctx.tokenId,
          } as Prisma.InputJsonValue,
          ipAddress: opts.ctx.ip,
        },
      });
    } catch (e) {
      console.error('[mcp/_write-helpers] auditMutation entity-log failed:', e);
    }
  }
  await logToolCall({
    tool: opts.tool,
    scopes: opts.ctx.scopes,
    status: 'ok',
    clientId: opts.ctx.clientId,
    tokenId: opts.ctx.tokenId,
    userId: opts.ctx.userId,
    ip: opts.ctx.ip,
    params: opts.params,
    resultSummary: opts.resultSummary ?? `${opts.action} ${opts.entityType}:${opts.entityName}`,
  });
}

/** Fire-and-forget revalidation; never raise into the tool handler. */
export async function safeInvalidate(paths: string[]) {
  try {
    await invalidatePages(paths);
  } catch (e) {
    console.error('[mcp/_write-helpers] invalidatePages failed:', e);
  }
}

/**
 * Build the canonical public resource URL based on category hierarchy.
 *   /resources/{parentSlug}/{categorySlug}/{slug}   (if subcategory)
 *   /resources/{categorySlug}/{slug}                (if top-level)
 */
export function resourcePublicPath(
  resourceSlug: string,
  category: { slug: string; parent: { slug: string } | null } | null | undefined
): string | null {
  if (!category) return null;
  return category.parent
    ? `/resources/${category.parent.slug}/${category.slug}/${resourceSlug}`
    : `/resources/${category.slug}/${resourceSlug}`;
}

/** Resource-category hierarchy validator (max depth = 2). Returns error string or null. */
export async function validateResourceCategoryParent(
  parentId: string | null | undefined,
  selfId?: string | null,
  selfHasChildren?: boolean
): Promise<string | null> {
  if (!parentId) return null;
  if (selfId && parentId === selfId) return 'Category cannot be its own parent';
  const parent = await prisma.resourceCategory.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true },
  });
  if (!parent) return 'Parent category not found';
  if (parent.parentId) return 'Cannot nest subcategories more than one level deep';
  if (selfId && selfHasChildren) return 'Cannot move a category with subcategories under another parent';
  return null;
}
