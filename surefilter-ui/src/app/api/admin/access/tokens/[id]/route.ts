import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { ALL_SCOPE_KEYS, validateScopes } from '@/mcp/scopes';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
import { alertTokenRevokedNotSelf } from '@/lib/mcp-alerts';

const UpdateTokenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(z.string()).min(1).optional(),
  dailyQuota: z.number().int().min(1).max(1_000_000).optional(),
  expiresAt: z.string().datetime().nullable().optional(), // ISO timestamp or null
});

const RevokeSchema = z.object({
  reason: z.string().max(500).optional(),
});

async function fetchTokenWithMeta(id: string) {
  const token = await prisma.apiToken.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!token) return null;

  let revokedBy: { id: string; email: string; name: string | null } | null = null;
  if (token.revokedById) {
    revokedBy = await prisma.user.findUnique({
      where: { id: token.revokedById },
      select: { id: true, email: true, name: true },
    });
  }

  const recentCalls = await prisma.adminLog.findMany({
    where: { action: 'MCP_TOOL_CALL', entityType: 'ApiToken', entityId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, createdAt: true, entityName: true, details: true, ipAddress: true },
  });

  return { token, revokedBy, recentCalls };
}

// GET /api/admin/access/tokens/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;
  const data = await fetchTokenWithMeta(id);
  if (!data) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

  return NextResponse.json(data);
}

// PATCH /api/admin/access/tokens/[id] — edit name / scopes / quota / expiry
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = UpdateTokenSchema.parse(body);

    const existing = await prisma.apiToken.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    if (existing.revokedAt) {
      return NextResponse.json({ error: 'Cannot edit a revoked token' }, { status: 400 });
    }

    if (data.scopes) {
      const unknown = validateScopes(data.scopes);
      if (unknown.length > 0) {
        return NextResponse.json(
          { error: 'Unknown scope(s)', details: { unknown, allowed: ALL_SCOPE_KEYS } },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.scopes !== undefined) updateData.scopes = data.scopes;
    if (data.dailyQuota !== undefined) updateData.dailyQuota = data.dailyQuota;
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    const updated = await prisma.apiToken.update({ where: { id }, data: updateData });

    const metadata = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'UPDATE',
      entityType: 'ApiToken',
      entityId: id,
      entityName: updated.name,
      details: { changes: Object.keys(updateData) },
      ...metadata,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error updating api token:', error);
    return NextResponse.json({ error: 'Failed to update token', details: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/access/tokens/[id] — soft revoke
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const data = RevokeSchema.parse(body);

    const existing = await prisma.apiToken.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    if (existing.revokedAt) {
      return NextResponse.json({ error: 'Token is already revoked' }, { status: 400 });
    }

    const revoked = await prisma.apiToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        revokedById: auth.user.id,
        revokedReason: data.reason ?? null,
      },
    });

    const metadata = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'TOKEN_REVOKED',
      entityType: 'ApiToken',
      entityId: id,
      entityName: revoked.name,
      details: { reason: data.reason ?? null, tokenPrefix: revoked.tokenPrefix },
      ...metadata,
    });

    // Phase 5: notify token owner when someone else revokes it
    if (existing.user && existing.user.id !== auth.user.id) {
      alertTokenRevokedNotSelf({
        tokenId: revoked.id,
        tokenName: revoked.name,
        tokenPrefix: revoked.tokenPrefix,
        ownerEmail: existing.user.email,
        revokedByEmail: auth.user.email,
        reason: data.reason ?? null,
      }).catch((e) => console.error('[mcp-alerts] revoke alert failed:', e));
    }

    return NextResponse.json({ ok: true, revokedAt: revoked.revokedAt });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error revoking api token:', error);
    return NextResponse.json({ error: 'Failed to revoke token', details: error.message }, { status: 500 });
  }
}
