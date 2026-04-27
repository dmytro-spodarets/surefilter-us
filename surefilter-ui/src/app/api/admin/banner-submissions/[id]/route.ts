import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  const submission = await prisma.bannerSubmission.findUnique({
    where: { id },
    include: { banner: { select: { id: true, name: true, slug: true, type: true } } },
  });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(submission);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    const sub = await prisma.bannerSubmission.findUnique({ where: { id } });
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.bannerSubmission.delete({ where: { id } });

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'DELETE',
      entityType: 'BannerSubmission',
      entityId: id,
      entityName: sub.email,
      ...meta,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting banner submission:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
