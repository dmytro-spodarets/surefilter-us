import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';

/**
 * Write an MCP_TOOL_CALL entry to AdminLog.
 *
 * We deliberately do NOT include large tool payloads — only the name, scope
 * subset that authorized the call, sanitized params, and the result status.
 * Bearer tokens / passwords / webhook secrets must never reach here.
 *
 * Schema constraint: AdminLog.userId is non-nullable, so anonymous calls
 * fall back to a synthetic "system" entry. For now we record `tokenId` in
 * `details` and store the token owner's userId when available; if neither
 * exists (anonymous public scope), the call is logged with details only —
 * the row is skipped to avoid violating the FK. Phase 5 can introduce a
 * dedicated McpCallLog model if anonymous metrics become important.
 */
export type ToolCallStatus = 'ok' | 'error' | 'forbidden';

export type ToolCallRecord = {
  tool: string;
  scopes: string[];
  status: ToolCallStatus;
  clientId: string;
  tokenId: string | null;
  userId: string | null;
  params?: Record<string, unknown>;
  resultSummary?: string;
  errorMessage?: string;
  ip?: string;
  userAgent?: string;
};

const SECRET_KEYS = new Set(['password', 'token', 'secret', 'apiKey', 'bearer', 'authorization']);

function sanitizeParams(params: Record<string, unknown> | undefined): Record<string, unknown> | null {
  if (!params || typeof params !== 'object') return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (SECRET_KEYS.has(k.toLowerCase())) {
      out[k] = '<redacted>';
    } else if (typeof v === 'string' && v.length > 200) {
      out[k] = `${v.slice(0, 200)}…(${v.length}ch)`;
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function logToolCall(rec: ToolCallRecord): Promise<void> {
  // Anonymous (public-scope) calls — skip DB write. Tracked via dev server logs only for now.
  if (!rec.userId) return;

  try {
    await prisma.adminLog.create({
      data: {
        userId: rec.userId,
        action: 'MCP_TOOL_CALL',
        entityType: 'ApiToken',
        entityId: rec.tokenId ?? null,
        entityName: rec.tool,
        details: {
          tool: rec.tool,
          scopes: rec.scopes,
          status: rec.status,
          clientId: rec.clientId,
          params: sanitizeParams(rec.params),
          resultSummary: rec.resultSummary ?? null,
          errorMessage: rec.errorMessage ?? null,
        } as Prisma.InputJsonValue,
        ipAddress: rec.ip,
        userAgent: rec.userAgent,
      },
    });
  } catch (e) {
    // Audit must never break the tool flow
    console.error('[mcp/audit] logToolCall failed:', e);
  }
}
