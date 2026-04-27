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

const UpdateBannerSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  type: z.enum(['LEAD_CAPTURE', 'CTA']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),

  layout: z.string().optional(),
  accentColor: z.string().nullable().optional(),
  backgroundColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),

  title: z.string().min(1).optional(),
  body: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),

  ctaLabel: z.string().nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
  ctaOpenInNewTab: z.boolean().optional(),

  emailPlaceholder: z.string().nullable().optional(),
  submitLabel: z.string().nullable().optional(),
  successTitle: z.string().nullable().optional(),
  successMessage: z.string().nullable().optional(),
  notifyEmail: z.string().nullable().optional(),

  targetAllPages: z.boolean().optional(),
  targetSlugs: z.array(z.string()).optional(),
  excludeSlugs: z.array(z.string()).optional(),

  delayMs: z.number().int().min(0).optional(),
  utmRules: z.array(UtmRuleSchema).nullable().optional(),
  refererRules: z.array(RefererRuleSchema).nullable().optional(),

  dismissMode: z.enum(['SESSION', 'DAYS', 'FOREVER']).optional(),
  dismissTtlDays: z.number().int().min(1).nullable().optional(),

  publishedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  priority: z.number().int().optional(),

  campaignId: z.string().nullable().optional(),
}).strict();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  const banner = await prisma.banner.findUnique({
    where: { id },
    include: { campaign: { select: { id: true, name: true } } },
  });
  if (!banner) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(banner);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdateBannerSchema.parse(body);

    if (data.slug) {
      const conflict = await prisma.banner.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (conflict) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.publishedAt !== undefined ? (data.publishedAt ? new Date(data.publishedAt) : null) : undefined,
        expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
        utmRules: data.utmRules !== undefined ? (data.utmRules ?? undefined) : undefined,
        refererRules: data.refererRules !== undefined ? (data.refererRules ?? undefined) : undefined,
      },
    });

    clearBannersCache();
    try { await invalidatePages(['/']); } catch {}

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'UPDATE',
      entityType: 'Banner',
      entityId: id,
      entityName: updated.name,
      ...meta,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.banner.delete({ where: { id } });

    clearBannersCache();
    try { await invalidatePages(['/']); } catch {}

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'DELETE',
      entityType: 'Banner',
      entityId: id,
      entityName: banner.name,
      ...meta,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
