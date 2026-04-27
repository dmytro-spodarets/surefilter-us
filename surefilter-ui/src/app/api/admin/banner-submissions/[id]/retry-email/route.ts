import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { sendBannerLeadNotificationEmail } from '@/lib/banner-email';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  try {
    await sendBannerLeadNotificationEmail(id);

    const meta = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'UPDATE',
      entityType: 'BannerSubmission',
      entityId: id,
      entityName: `Retry email for ${id}`,
      ...meta,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
