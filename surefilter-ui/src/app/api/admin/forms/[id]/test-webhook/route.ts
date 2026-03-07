import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { testWebhook } from '@/lib/webhook';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

// POST /api/admin/forms/[id]/test-webhook - Test webhook configuration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { id } = await params;

    // Get form
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        webhookUrl: true,
        webhookHeaders: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    if (!form.webhookUrl) {
      return NextResponse.json(
        { error: 'No webhook URL configured for this form' },
        { status: 400 }
      );
    }

    // Test webhook
    const result = await testWebhook(
      form.webhookUrl,
      form.webhookHeaders as Record<string, string> | undefined
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Webhook test successful',
        statusCode: result.statusCode,
        response: result.response,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Webhook test failed',
        statusCode: result.statusCode,
        error: 'Webhook delivery failed',
      });
    }
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}

