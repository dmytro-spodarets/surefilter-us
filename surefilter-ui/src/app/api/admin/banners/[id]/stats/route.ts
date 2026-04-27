import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  const banner = await prisma.banner.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      impressionCount: true,
      clickCount: true,
      submissionCount: true,
    },
  });
  if (!banner) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [impressionsByDay, clicksByDay, byPage, byReferer] = await Promise.all([
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "BannerImpression"
      WHERE "bannerId" = ${id} AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "BannerClick"
      WHERE "bannerId" = ${id} AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ page: string | null; count: bigint }>>`
      SELECT "pageSlug" AS page, COUNT(*)::bigint AS count
      FROM "BannerImpression"
      WHERE "bannerId" = ${id} AND "createdAt" >= ${since}
      GROUP BY "pageSlug"
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<Array<{ referer: string | null; count: bigint }>>`
      SELECT "referer", COUNT(*)::bigint AS count
      FROM "BannerImpression"
      WHERE "bannerId" = ${id} AND "createdAt" >= ${since}
      GROUP BY "referer"
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  return NextResponse.json({
    banner,
    totals: {
      impressions: banner.impressionCount,
      clicks: banner.clickCount,
      submissions: banner.submissionCount,
    },
    timeseries: {
      impressions: impressionsByDay.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) })),
      clicks: clicksByDay.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) })),
    },
    breakdown: {
      pages: byPage.map((r) => ({ key: r.page || '(none)', count: Number(r.count) })),
      referers: byReferer.map((r) => ({ key: r.referer || '(direct)', count: Number(r.count) })),
    },
  });
}
