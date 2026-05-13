import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

/**
 * Aggregate MCP usage from AdminLog. Phase 0: returns empty/zeroes until
 * MCP_TOOL_CALL entries start being produced by the server (Phase 1+).
 */
export async function GET() {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, byTool, byToken, recent] = await Promise.all([
    prisma.adminLog.count({
      where: { action: 'MCP_TOOL_CALL', createdAt: { gte: since } },
    }),
    prisma.$queryRaw<Array<{ tool: string; calls: bigint }>>`
      SELECT (details->>'tool') AS tool, COUNT(*)::bigint AS calls
      FROM "AdminLog"
      WHERE "action" = 'MCP_TOOL_CALL' AND "createdAt" >= ${since}
      GROUP BY (details->>'tool')
      ORDER BY calls DESC
      LIMIT 10
    `,
    prisma.$queryRaw<Array<{ token_id: string; calls: bigint }>>`
      SELECT "entityId" AS token_id, COUNT(*)::bigint AS calls
      FROM "AdminLog"
      WHERE "action" = 'MCP_TOOL_CALL' AND "createdAt" >= ${since} AND "entityId" IS NOT NULL
      GROUP BY "entityId"
      ORDER BY calls DESC
      LIMIT 10
    `,
    prisma.adminLog.findMany({
      where: { action: 'MCP_TOOL_CALL' },
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: { id: true, createdAt: true, entityId: true, entityName: true, details: true, ipAddress: true },
    }),
  ]);

  return NextResponse.json({
    sinceIso: since.toISOString(),
    totalCalls30d: total,
    topTools: byTool.map((r) => ({ tool: r.tool, calls: Number(r.calls) })),
    topTokens: byToken.map((r) => ({ tokenId: r.token_id, calls: Number(r.calls) })),
    recent,
  });
}
