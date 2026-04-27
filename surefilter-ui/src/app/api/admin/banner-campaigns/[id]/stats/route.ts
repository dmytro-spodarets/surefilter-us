import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  const campaign = await prisma.bannerCampaign.findUnique({
    where: { id },
    include: {
      banners: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
          impressionCount: true,
          clickCount: true,
          submissionCount: true,
        },
      },
    },
  });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const bannerIds = campaign.banners.map((b) => b.id);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30d

  const [impressionsByDay, clicksByDay] = await Promise.all([
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "BannerImpression"
      WHERE "bannerId" = ANY(${bannerIds}) AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "BannerClick"
      WHERE "bannerId" = ANY(${bannerIds}) AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
  ]);

  const totalImpressions = campaign.banners.reduce((s, b) => s + b.impressionCount, 0);
  const totalClicks = campaign.banners.reduce((s, b) => s + b.clickCount, 0);
  const totalSubmissions = campaign.banners.reduce((s, b) => s + b.submissionCount, 0);

  return NextResponse.json({
    campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug, status: campaign.status },
    totals: { impressions: totalImpressions, clicks: totalClicks, submissions: totalSubmissions },
    banners: campaign.banners,
    timeseries: {
      impressions: impressionsByDay.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) })),
      clicks: clicksByDay.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) })),
    },
  });
}
