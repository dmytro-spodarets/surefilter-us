import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
import { clearBannersCache } from '@/lib/banners';

const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional().default('ACTIVE'),
  notifyEmail: z.string().nullable().optional(),
}).strict();

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const sp = request.nextUrl.searchParams;
    const status = sp.get('status');
    const search = sp.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const campaigns = await prisma.bannerCampaign.findMany({
      where,
      include: { _count: { select: { banners: true } } },
      orderBy: [{ updatedAt: 'desc' }],
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const body = await request.json();
    const data = CreateCampaignSchema.parse(body);

    const existing = await prisma.bannerCampaign.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Campaign with this slug already exists' }, { status: 409 });
    }

    const campaign = await prisma.bannerCampaign.create({ data });
    clearBannersCache();

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'CREATE',
      entityType: 'BannerCampaign',
      entityId: campaign.id,
      entityName: campaign.name,
      ...meta,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
