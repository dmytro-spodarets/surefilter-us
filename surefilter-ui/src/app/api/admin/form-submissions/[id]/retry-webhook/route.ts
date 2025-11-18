import { NextRequest, NextResponse } from 'next/server';
import { retryWebhook } from '@/lib/webhook';

// POST /api/admin/form-submissions/[id]/retry-webhook - Retry failed webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await retryWebhook(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Webhook sent successfully',
        attempts: result.attempts,
        response: result.response,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Webhook failed after retry',
        attempts: result.attempts,
        error: result.error,
        response: result.response,
      });
    }
  } catch (error: any) {
    console.error('Error retrying webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retry webhook' },
      { status: 500 }
    );
  }
}

