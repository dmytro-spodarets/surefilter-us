import { NextRequest, NextResponse } from 'next/server';
import { retryEmail } from '@/lib/email';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

// POST /api/admin/form-submissions/[id]/retry-email - Retry failed email notification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;

    const result = await retryEmail(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email notification sent successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email notification failed',
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error retrying email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retry email' },
      { status: 500 }
    );
  }
}
