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

  const [total, byTool, byToken, byStatus, timeseries, recent] = await Promise.all([
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
    prisma.$queryRaw<Array<{ status: string; calls: bigint }>>`
      SELECT (details->>'status') AS status, COUNT(*)::bigint AS calls
      FROM "AdminLog"
      WHERE "action" = 'MCP_TOOL_CALL' AND "createdAt" >= ${since}
      GROUP BY (details->>'status')
    `,
    prisma.$queryRaw<Array<{ day: Date; calls: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS calls
      FROM "AdminLog"
      WHERE "action" = 'MCP_TOOL_CALL' AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.adminLog.findMany({
      where: { action: 'MCP_TOOL_CALL' },
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: { id: true, createdAt: true, entityId: true, entityName: true, details: true, ipAddress: true },
    }),
  ]);

  // Resolve top-token IDs to a name + owner email (so the dashboard can show
  // something more useful than a cuid).
  const tokenIds = byToken.map((r) => r.token_id);
  const tokens = tokenIds.length
    ? await prisma.apiToken.findMany({
        where: { id: { in: tokenIds } },
        select: { id: true, name: true, tokenPrefix: true, user: { select: { email: true } } },
      })
    : [];
  const tokenMap = new Map(tokens.map((t) => [t.id, t]));
  const topTokens = byToken.map((r) => {
    const meta = tokenMap.get(r.token_id);
    return {
      tokenId: r.token_id,
      name: meta?.name ?? null,
      tokenPrefix: meta?.tokenPrefix ?? null,
      ownerEmail: meta?.user?.email ?? null,
      calls: Number(r.calls),
    };
  });

  // Build a complete 30-day timeseries (fill missing days with 0) so charts
  // are evenly spaced regardless of whether a day had any calls.
  const days = 30;
  const dayMap = new Map<string, number>();
  for (const row of timeseries) {
    const key = row.day.toISOString().slice(0, 10);
    dayMap.set(key, Number(row.calls));
  }
  const filledTimeseries: Array<{ day: string; calls: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    filledTimeseries.push({ day: key, calls: dayMap.get(key) ?? 0 });
  }

  const statusBreakdown = byStatus.reduce((acc, r) => {
    acc[r.status ?? 'unknown'] = Number(r.calls);
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    sinceIso: since.toISOString(),
    totalCalls30d: total,
    statusBreakdown, // { ok, error, forbidden, … }
    topTools: byTool.map((r) => ({ tool: r.tool, calls: Number(r.calls) })),
    topTokens,
    timeseries: filledTimeseries,
    recent,
  });
}
