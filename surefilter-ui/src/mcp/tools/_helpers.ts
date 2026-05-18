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

/**
 * Mask an IPv4/IPv6 address — keeps the first octet/segment only.
 *   "192.168.1.42"     → "192.x.x.x"
 *   "2001:db8::1"      → "2001:x:x:x"
 *   "127.0.0.1"        → "127.x.x.x"
 *   null / undefined   → ""
 */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return '';
  if (ip.includes(':')) {
    const [head] = ip.split(':');
    return `${head}:x:x:x`;
  }
  const [head] = ip.split('.');
  return `${head}.x.x.x`;
}

/**
 * Sanitize a free-form submission `data` JSON for non-elevated viewers.
 * Walks one level deep and:
 *   - masks email-shaped strings via maskEmail()
 *   - redacts values whose key looks like a secret (password / token / secret / apiKey / ssn / phone)
 *   - truncates strings longer than 200 chars
 *
 * This is conservative — we keep the structure so the caller can still
 * tell what fields were submitted, but strip the values that look risky.
 */
const SUBMISSION_SECRET_KEY_RE = /^(password|token|secret|api[_-]?key|ssn|tax[_-]?id)$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeSubmissionData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    if (EMAIL_RE.test(data)) return maskEmail(data);
    if (data.length > 200) return `${data.slice(0, 200)}…(${data.length}ch)`;
    return data;
  }
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeSubmissionData);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (SUBMISSION_SECRET_KEY_RE.test(k)) {
      out[k] = '<redacted>';
    } else {
      out[k] = sanitizeSubmissionData(v);
    }
  }
  return out;
}
