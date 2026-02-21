import { revalidatePath, revalidateTag } from 'next/cache';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

const distId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

let cfClient: CloudFrontClient | null = null;
function getCfClient() {
  if (!cfClient) {
    cfClient = new CloudFrontClient({ region: process.env.AWS_REGION || 'us-east-1' });
  }
  return cfClient;
}

/**
 * Invalidate both Next.js ISR cache and CloudFront edge cache.
 * Call from admin API routes after content updates.
 *
 * @param paths  URL paths to invalidate, e.g. ['/newsroom', '/newsroom/my-article']
 * @param tags   Optional cache tags to invalidate, e.g. ['page:home']
 */
export async function invalidatePages(paths: string[], tags?: string[]) {
  // 1. Next.js ISR cache
  for (const p of paths) {
    revalidatePath(p, 'page');
  }
  for (const t of tags ?? []) {
    revalidateTag(t);
  }

  // 2. CloudFront edge cache
  if (!distId || paths.length === 0) return;

  try {
    await getCfClient().send(
      new CreateInvalidationCommand({
        DistributionId: distId,
        InvalidationBatch: {
          Paths: { Quantity: paths.length, Items: paths },
          CallerReference: `inv-${Date.now()}`,
        },
      })
    );
  } catch (e) {
    console.error('CloudFront invalidation failed:', e);
  }
}
