import 'server-only';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import type { ApiToken } from '@/generated/prisma';

const TOKEN_PREFIX = 'sfpat_';
const TOKEN_RANDOM_BYTES = 32;
const PREFIX_VISIBLE_CHARS = 10;

export type ApiTokenVerifyResult =
  | { ok: true; token: ApiToken }
  | { ok: false; reason: 'invalid' | 'revoked' | 'expired' | 'quota_exceeded' };

export type GenerateTokenResult = {
  plaintext: string;
  tokenHash: string;
  tokenPrefix: string;
};

export function generateToken(): GenerateTokenResult {
  const random = randomBytes(TOKEN_RANDOM_BYTES).toString('base64url');
  const plaintext = `${TOKEN_PREFIX}${random}`;
  const tokenHash = hashToken(plaintext);
  const tokenPrefix = plaintext.slice(0, PREFIX_VISIBLE_CHARS);
  return { plaintext, tokenHash, tokenPrefix };
}

export function hashToken(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex');
}

export function isValidTokenFormat(plaintext: string): boolean {
  return plaintext.startsWith(TOKEN_PREFIX) && plaintext.length >= TOKEN_PREFIX.length + 22;
}

function todayStartUtc(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function verifyToken(
  plaintext: string | null | undefined,
  opts: { ip?: string } = {}
): Promise<ApiTokenVerifyResult> {
  if (!plaintext || !isValidTokenFormat(plaintext)) {
    return { ok: false, reason: 'invalid' };
  }

  const tokenHash = hashToken(plaintext);
  const token = await prisma.apiToken.findUnique({ where: { tokenHash } });
  if (!token) return { ok: false, reason: 'invalid' };

  if (token.revokedAt) return { ok: false, reason: 'revoked' };
  if (token.expiresAt && token.expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: 'expired' };
  }

  // Daily quota reset + enforcement
  const today = todayStartUtc();
  const counterDate = token.requestCountDate
    ? new Date(Date.UTC(
        token.requestCountDate.getUTCFullYear(),
        token.requestCountDate.getUTCMonth(),
        token.requestCountDate.getUTCDate()
      ))
    : null;
  const sameDay = counterDate?.getTime() === today.getTime();
  const nextCount = sameDay ? token.requestCountToday + 1 : 1;

  if (sameDay && token.requestCountToday >= token.dailyQuota) {
    return { ok: false, reason: 'quota_exceeded' };
  }

  // Atomic increment + lastUsed
  const updated = await prisma.apiToken.update({
    where: { id: token.id },
    data: {
      lastUsedAt: new Date(),
      lastUsedIp: opts.ip ?? token.lastUsedIp,
      requestCountToday: nextCount,
      requestCountDate: today,
    },
  });

  return { ok: true, token: updated };
}

/**
 * Match a token's granted scopes against a required scope.
 * Supports wildcards: `domain:*` and the super-wildcard `admin:*`.
 *
 *   hasScope(['catalog:*'], 'catalog:read')   // true
 *   hasScope(['admin:*'], 'settings:write')   // true
 *   hasScope(['public:catalog'], 'catalog:read') // false
 */
export function hasScope(grantedScopes: string[], required: string): boolean {
  if (!required) return true;
  if (grantedScopes.includes(required)) return true;
  if (grantedScopes.includes('admin:*')) return true;

  const [domain] = required.split(':');
  if (domain && grantedScopes.includes(`${domain}:*`)) return true;

  return false;
}

/** True iff token has every required scope. */
export function hasAllScopes(grantedScopes: string[], required: string[]): boolean {
  return required.every((r) => hasScope(grantedScopes, r));
}

/** Constant-time comparison for any future direct token-equality checks. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
