import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
import { clearBannersCache } from '@/lib/banners';

const UpdateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  notifyEmail: z.string().nullable().optional(),
}).strict();

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
  return NextResponse.json(campaign);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdateCampaignSchema.parse(body);

    if (data.slug) {
      const conflict = await prisma.bannerCampaign.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (conflict) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const updated = await prisma.bannerCampaign.update({ where: { id }, data });
    clearBannersCache();

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'UPDATE',
      entityType: 'BannerCampaign',
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
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    const campaign = await prisma.bannerCampaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Banners stay (campaignId set to null) — onDelete: SetNull on the relation
    await prisma.bannerCampaign.delete({ where: { id } });
    clearBannersCache();

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'DELETE',
      entityType: 'BannerCampaign',
      entityId: id,
      entityName: campaign.name,
      ...meta,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
