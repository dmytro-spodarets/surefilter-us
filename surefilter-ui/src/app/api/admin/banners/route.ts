import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
import { invalidatePages } from '@/lib/revalidate';
import { clearBannersCache } from '@/lib/banners';

const UtmRuleSchema = z.object({
  key: z.string().min(1),
  op: z.enum(['equals', 'contains', 'startsWith']),
  value: z.string(),
});

const RefererRuleSchema = z.object({
  op: z.enum(['equals', 'contains', 'startsWith']),
  value: z.string().min(1),
});

const CreateBannerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  type: z.enum(['LEAD_CAPTURE', 'CTA']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),

  layout: z.string().optional().default('classic_centered'),
  accentColor: z.string().nullable().optional(),
  backgroundColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),

  title: z.string().min(1),
  body: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),

  ctaLabel: z.string().nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
  ctaOpenInNewTab: z.boolean().optional().default(false),

  emailPlaceholder: z.string().nullable().optional(),
  submitLabel: z.string().nullable().optional(),
  successTitle: z.string().nullable().optional(),
  successMessage: z.string().nullable().optional(),
  notifyEmail: z.string().nullable().optional(),

  targetAllPages: z.boolean().optional().default(true),
  targetSlugs: z.array(z.string()).optional().default([]),
  excludeSlugs: z.array(z.string()).optional().default([]),

  delayMs: z.number().int().min(0).optional().default(5000),
  utmRules: z.array(UtmRuleSchema).nullable().optional(),
  refererRules: z.array(RefererRuleSchema).nullable().optional(),

  dismissMode: z.enum(['SESSION', 'DAYS', 'FOREVER']).optional().default('DAYS'),
  dismissTtlDays: z.number().int().min(1).nullable().optional(),

  publishedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  priority: z.number().int().optional().default(0),

  campaignId: z.string().nullable().optional(),
}).strict();

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const sp = request.nextUrl.searchParams;
    const type = sp.get('type');
    const status = sp.get('status');
    const campaignId = sp.get('campaignId');
    const search = sp.get('search');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (campaignId) where.campaignId = campaignId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const banners = await prisma.banner.findMany({
      where,
      include: { campaign: { select: { id: true, name: true } } },
      orderBy: [{ updatedAt: 'desc' }],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const body = await request.json();
    const data = CreateBannerSchema.parse(body);

    const existing = await prisma.banner.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Banner with this slug already exists' }, { status: 409 });
    }

    const banner = await prisma.banner.create({
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        utmRules: data.utmRules ?? undefined,
        refererRules: data.refererRules ?? undefined,
      },
    });

    clearBannersCache();
    try { await invalidatePages(['/']); } catch {}

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'CREATE',
      entityType: 'Banner',
      entityId: banner.id,
      entityName: banner.name,
      ...meta,
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
