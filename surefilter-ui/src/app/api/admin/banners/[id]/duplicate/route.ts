import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
import { clearBannersCache } from '@/lib/banners';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    const original = await prisma.banner.findUnique({ where: { id } });
    if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Find unused slug: <slug>-copy, <slug>-copy-2, ...
    let newSlug = `${original.slug}-copy`;
    let counter = 2;
    while (await prisma.banner.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${original.slug}-copy-${counter++}`;
    }

    const {
      id: _id,
      createdAt: _ca,
      updatedAt: _ua,
      impressionCount: _ic,
      clickCount: _cc,
      submissionCount: _sc,
      slug: _slug,
      utmRules,
      refererRules,
      layoutConfig,
      ...rest
    } = original;

    const dup = await prisma.banner.create({
      data: {
        ...rest,
        slug: newSlug,
        name: `${original.name} (copy)`,
        status: 'DRAFT',
        utmRules: utmRules ?? undefined,
        refererRules: refererRules ?? undefined,
        layoutConfig: layoutConfig ?? undefined,
      },
    });

    clearBannersCache();

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'CREATE',
      entityType: 'Banner',
      entityId: dup.id,
      entityName: `${dup.name} (duplicated from ${original.name})`,
      ...meta,
    });

    return NextResponse.json(dup, { status: 201 });
  } catch (error) {
    console.error('Error duplicating banner:', error);
    return NextResponse.json({ error: 'Failed to duplicate' }, { status: 500 });
  }
}
