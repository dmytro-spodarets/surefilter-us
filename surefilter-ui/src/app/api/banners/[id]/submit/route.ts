import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { bannerSubmitLimiter, getClientIp } from '@/lib/rate-limiter';
import { sendBannerLeadNotificationEmailAsync } from '@/lib/banner-email';

export const dynamic = 'force-dynamic';

const SubmitSchema = z.object({
  email: z.string().email().max(254),
  pageUrl: z.string().nullable().optional(),
  pageSlug: z.string().nullable().optional(),
  utmParams: z.record(z.string(), z.string()).nullable().optional(),
  referer: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  // Honeypot — must be empty
  website: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = getClientIp(request);

  const limit = bannerSubmitLimiter.check(`submit:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    );
  }

  let parsed;
  try {
    const body = await request.json();
    parsed = SubmitSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot — silently accept but don't process
  if (parsed.website && parsed.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const banner = await prisma.banner.findUnique({
    where: { id },
    include: { campaign: { select: { notifyEmail: true } } },
  });
  if (!banner) {
    return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
  }
  if (banner.type !== 'LEAD_CAPTURE') {
    return NextResponse.json({ error: 'This banner does not accept submissions' }, { status: 400 });
  }
  if (banner.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Banner not active' }, { status: 400 });
  }

  let submission;
  try {
    [submission] = await prisma.$transaction([
      prisma.bannerSubmission.create({
        data: {
          bannerId: id,
          email: parsed.email,
          pageUrl: parsed.pageUrl ?? null,
          utmParams: parsed.utmParams ?? undefined,
          referer: parsed.referer ?? null,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent'),
        },
      }),
      prisma.banner.update({
        where: { id },
        data: { submissionCount: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    console.error('Banner submission failed:', error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  // Fire-and-forget email — notifyEmail fallback chain: banner → campaign
  const effectiveNotifyEmail = banner.notifyEmail || banner.campaign?.notifyEmail || null;
  if (effectiveNotifyEmail) {
    sendBannerLeadNotificationEmailAsync(submission.id);
  }

  return NextResponse.json({ ok: true, id: submission.id });
}
