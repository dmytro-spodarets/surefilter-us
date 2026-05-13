import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { generateToken } from '@/lib/api-token';
import { ALL_SCOPE_KEYS, validateScopes } from '@/mcp/scopes';
import { getMcpSettings } from '@/lib/mcp-settings';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

const CreateTokenSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  ownerUserId: z.string().min(1).optional(), // defaults to current admin
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  ttlDays: z.number().int().min(0).max(3650).optional(), // 0 or omitted → settings default
  dailyQuota: z.number().int().min(1).max(1_000_000).optional(),
});

type TokenListRow = {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  ownerUserId: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  revokedReason: string | null;
  dailyQuota: number;
  requestCountToday: number;
  status: 'active' | 'expired' | 'revoked';
};

function tokenStatus(t: { revokedAt: Date | null; expiresAt: Date | null }): TokenListRow['status'] {
  if (t.revokedAt) return 'revoked';
  if (t.expiresAt && t.expiresAt.getTime() <= Date.now()) return 'expired';
  return 'active';
}

// GET /api/admin/access/tokens — list all tokens visible to admins
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active' | 'revoked' | 'expired' | null
    const ownerId = searchParams.get('ownerId');
    const search = searchParams.get('q');

    const where: any = {};
    if (ownerId) where.userId = ownerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tokenPrefix: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status === 'revoked') where.revokedAt = { not: null };
    if (status === 'active') {
      where.revokedAt = null;
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
    }
    if (status === 'expired') {
      where.revokedAt = null;
      where.expiresAt = { lte: new Date() };
    }

    const tokens = await prisma.apiToken.findMany({
      where,
      orderBy: [{ revokedAt: { sort: 'asc', nulls: 'first' } }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    const rows: TokenListRow[] = tokens.map((t) => ({
      id: t.id,
      name: t.name,
      tokenPrefix: t.tokenPrefix,
      scopes: t.scopes,
      ownerUserId: t.userId,
      ownerEmail: t.user?.email ?? null,
      ownerName: t.user?.name ?? null,
      createdAt: t.createdAt,
      lastUsedAt: t.lastUsedAt,
      lastUsedIp: t.lastUsedIp,
      expiresAt: t.expiresAt,
      revokedAt: t.revokedAt,
      revokedReason: t.revokedReason,
      dailyQuota: t.dailyQuota,
      requestCountToday: t.requestCountToday,
      status: tokenStatus(t),
    }));

    return NextResponse.json({ tokens: rows });
  } catch (error: any) {
    console.error('Error listing api tokens:', error);
    return NextResponse.json({ error: 'Failed to list tokens', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/access/tokens — create new token (plaintext returned once)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const body = await request.json();
    const data = CreateTokenSchema.parse(body);

    // Validate scopes
    const unknown = validateScopes(data.scopes);
    if (unknown.length > 0) {
      return NextResponse.json(
        { error: 'Unknown scope(s)', details: { unknown, allowed: ALL_SCOPE_KEYS } },
        { status: 400 }
      );
    }

    // Resolve owner
    const ownerUserId = data.ownerUserId ?? auth.user.id;
    const ownerExists = await prisma.user.findUnique({ where: { id: ownerUserId }, select: { id: true } });
    if (!ownerExists) {
      return NextResponse.json({ error: 'Owner user not found' }, { status: 400 });
    }

    // Resolve TTL + quota defaults from MCP settings
    const settings = await getMcpSettings();
    const ttlDays = data.ttlDays ?? settings.defaultTokenTtlDays;
    const dailyQuota = data.dailyQuota ?? settings.defaultDailyQuota;
    const expiresAt = ttlDays > 0 ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;

    const { plaintext, tokenHash, tokenPrefix } = generateToken();

    const token = await prisma.apiToken.create({
      data: {
        userId: ownerUserId,
        name: data.name,
        tokenHash,
        tokenPrefix,
        scopes: data.scopes,
        expiresAt,
        dailyQuota,
      },
    });

    const metadata = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'TOKEN_CREATED',
      entityType: 'ApiToken',
      entityId: token.id,
      entityName: token.name,
      details: {
        ownerUserId,
        scopes: data.scopes,
        tokenPrefix: token.tokenPrefix,
        expiresAt: expiresAt?.toISOString() ?? null,
        dailyQuota,
      },
      ...metadata,
    });

    // plaintext returned ONLY in this response — never persisted
    return NextResponse.json(
      {
        id: token.id,
        name: token.name,
        tokenPrefix: token.tokenPrefix,
        scopes: token.scopes,
        expiresAt: token.expiresAt,
        dailyQuota: token.dailyQuota,
        plaintext,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error creating api token:', error);
    return NextResponse.json({ error: 'Failed to create token', details: error.message }, { status: 500 });
  }
}
