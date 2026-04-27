import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bannerImpressionLimiter, getClientIp } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = getClientIp(request);

  const limit = bannerImpressionLimiter.check(`${ip}:${id}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // sendBeacon may send empty/blob body — ignore
  }

  try {
    await prisma.$transaction([
      prisma.bannerImpression.create({
        data: {
          bannerId: id,
          pageUrl: typeof body.pageUrl === 'string' ? body.pageUrl : null,
          pageSlug: typeof body.pageSlug === 'string' ? body.pageSlug : null,
          utmParams: body.utmParams && typeof body.utmParams === 'object' ? body.utmParams : undefined,
          referer: typeof body.referer === 'string' ? body.referer : null,
          sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent'),
        },
      }),
      prisma.banner.update({
        where: { id },
        data: { impressionCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    // Banner might be deleted between fetch and tracking — silent fail is fine
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
