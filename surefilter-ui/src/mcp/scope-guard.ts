import { hasScope } from '@/lib/api-token';

/**
 * Determine the effective mode for a tool based on the caller's scopes.
 *
 *   'admin'  — caller has <domain>:read (or <domain>:* / admin:*); sees drafts,
 *              full payloads, no filters applied.
 *   'public' — caller has only public:<domain>; tool must filter to
 *              published / safe-to-expose content.
 *   null     — no relevant scope; tool should be denied (caller does not see
 *              this tool in tools/list either).
 */
export function effectiveMode(scopes: string[], domain: string): 'admin' | 'public' | null {
  if (hasScope(scopes, `${domain}:read`)) return 'admin';
  if (scopes.includes(`public:${domain}`)) return 'public';
  return null;
}

/**
 * Returns true iff every required scope is present.
 * Use for tools that don't have a public-mode fallback (e.g. write tools).
 */
export function hasAllScopes(scopes: string[], required: string[]): boolean {
  return required.every((r) => hasScope(scopes, r));
}

/**
 * Returns true iff at least one of the alternatives is present.
 * Use when a tool accepts multiple scope variants (e.g. catalog:read OR public:catalog).
 */
export function hasAnyScope(scopes: string[], alternatives: string[]): boolean {
  return alternatives.some((a) => hasScope(scopes, a));
}

/**
 * Shorthand error builder for forbidden tool calls. The SDK wraps thrown errors
 * into `{ isError: true, content: [...] }` automatically, but for clarity we
 * return the structure manually so the caller can log + return in one step.
 */
export function forbidden(message: string) {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: `Forbidden: ${message}` }],
  };
}
