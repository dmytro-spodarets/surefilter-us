import { hasScope } from '@/lib/api-token';
import { forbidden } from '@/mcp/scope-guard';
import { logToolCall } from '@/mcp/audit';

export type ExtraContext = {
  authInfo?: { scopes: string[]; clientId: string; extra?: any };
};

export type AuthCtx = {
  scopes: string[];
  clientId: string;
  tokenId: string | null;
  userId: string | null;
  ip?: string;
  /** True iff token carries admin:* (unlocks redacted fields). */
  elevated: boolean;
};

export function authContext(extra: ExtraContext): AuthCtx {
  const auth = extra.authInfo;
  const scopes = auth?.scopes ?? [];
  return {
    scopes,
    clientId: auth?.clientId ?? 'anonymous',
    tokenId: (auth?.extra?.tokenId as string | null) ?? null,
    userId: (auth?.extra?.userId as string | null) ?? null,
    ip: (auth?.extra?.ip as string | undefined) ?? undefined,
    elevated: scopes.includes('admin:*'),
  };
}

/** MCP "ok" result wrapping JSON payload as text content. */
export function jsonResult(payload: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }] };
}

/** MCP "ok" result with plain string. */
export function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

/** MCP error result with a single text message. */
export function errorResult(text: string) {
  return { isError: true as const, content: [{ type: 'text' as const, text }] };
}

/**
 * Helper for admin-only read tools.
 * Returns null on success (caller proceeds); a forbidden MCP result otherwise.
 * Also writes a `forbidden` audit entry so unauthorized attempts surface in usage dashboards.
 */
export async function requireScope(
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

/** Mask an email like `foo@bar.com` → `f*o@bar.com`. */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  if (local.length <= 2) return `${local[0] ?? '*'}***@${domain}`;
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`;
}
