import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { generateToken } from '@/lib/api-token';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

// POST /api/admin/access/tokens/[id]/regenerate
// Revokes the existing token (reason='REGENERATED') and issues a new token with
// the same name/scopes/dailyQuota/expiresAt. Plaintext returned once.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  const metadata = getRequestMetadata(request);

  try {
    const existing = await prisma.apiToken.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    if (existing.revokedAt) {
      return NextResponse.json({ error: 'Cannot regenerate a revoked token' }, { status: 400 });
    }

    const { plaintext, tokenHash, tokenPrefix } = generateToken();

    const [revoked, fresh] = await prisma.$transaction([
      prisma.apiToken.update({
        where: { id },
        data: {
          revokedAt: new Date(),
          revokedById: auth.user.id,
          revokedReason: 'REGENERATED',
        },
      }),
      prisma.apiToken.create({
        data: {
          userId: existing.userId,
          name: existing.name,
          tokenHash,
          tokenPrefix,
          scopes: existing.scopes,
          expiresAt: existing.expiresAt,
          dailyQuota: existing.dailyQuota,
        },
      }),
    ]);

    await logAdminAction({
      userId: auth.user.id,
      action: 'TOKEN_REGENERATED',
      entityType: 'ApiToken',
      entityId: fresh.id,
      entityName: fresh.name,
      details: {
        previousTokenId: revoked.id,
        previousTokenPrefix: revoked.tokenPrefix,
        newTokenPrefix: fresh.tokenPrefix,
      },
      ...metadata,
    });

    return NextResponse.json(
      {
        id: fresh.id,
        name: fresh.name,
        tokenPrefix: fresh.tokenPrefix,
        scopes: fresh.scopes,
        expiresAt: fresh.expiresAt,
        dailyQuota: fresh.dailyQuota,
        plaintext,
        previousTokenId: revoked.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error regenerating api token:', error);
    return NextResponse.json({ error: 'Failed to regenerate token', details: error.message }, { status: 500 });
  }
}
