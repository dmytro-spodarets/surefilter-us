import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clearSiteSettingsCache } from '@/lib/site-settings';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

// POST /api/admin/cache — Clear all caches (ISR + CloudFront + in-memory)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: {
    inMemory: boolean;
    isr: boolean;
    cloudfront: { invalidationId?: string; distributionId?: string } | null;
    timestamp: string;
  } = {
    inMemory: false,
    isr: false,
    cloudfront: null,
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Clear in-memory site settings cache
    clearSiteSettingsCache();
    results.inMemory = true;

    // 2. Invalidate all ISR pages
    revalidatePath('/', 'layout');
    results.isr = true;

    // 3. Invalidate CloudFront edge cache
    const distId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    if (distId) {
      const { CloudFrontClient, CreateInvalidationCommand } = await import('@aws-sdk/client-cloudfront');
      const cf = new CloudFrontClient({ region: process.env.AWS_REGION || 'us-east-1' });
      const cfResult = await cf.send(new CreateInvalidationCommand({
        DistributionId: distId,
        InvalidationBatch: {
          Paths: { Quantity: 1, Items: ['/*'] },
          CallerReference: `manual-${Date.now()}`,
        },
      }));
      results.cloudfront = {
        invalidationId: cfResult.Invalidation?.Id,
        distributionId: distId,
      };
    }

    // Log action
    const metadata = getRequestMetadata(request);
    await logAdminAction({
      userId: (session as any).userId,
      action: 'UPDATE',
      entityType: 'Cache',
      entityId: 'all',
      entityName: 'Clear All Cache',
      details: { type: 'manual_cache_clear', results },
      ...metadata,
    });

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json({ error: 'Failed to clear cache', results }, { status: 500 });
  }
}
