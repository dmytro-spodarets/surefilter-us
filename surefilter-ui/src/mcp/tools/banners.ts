import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, requireScope, maskEmail, maskIp, type ExtraContext } from '@/mcp/tools/_helpers';

function redactBannerSubmission<T extends { email: string; ipAddress: string | null; userAgent: string | null }>(sub: T, elevated: boolean): T {
  if (elevated) return sub;
  return {
    ...sub,
    email: maskEmail(sub.email),
    ipAddress: maskIp(sub.ipAddress),
    userAgent: sub.userAgent ? '<redacted>' : null,
  } as T;
}

function redactBanner<T extends { notifyEmail?: string | null }>(b: T, elevated: boolean): T {
  if (elevated || !b.notifyEmail) return b;
  return { ...b, notifyEmail: '<redacted>' } as T;
}

export function registerBannersTools(server: McpServer) {
  // ─────────── banners-list ───────────
  server.registerTool(
    'banners-list',
    {
      description:
        'List popup banners (banners:read). Includes counters (impressionCount/clickCount/submissionCount), schedule (publishedAt/expiresAt), and campaign. notifyEmail redacted unless admin:*.',
      inputSchema: {
        status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
        type: z.enum(['LEAD_CAPTURE', 'CTA']).optional(),
        campaignId: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'banners:read', 'banners-list', args);
      if (deny) return deny;

      const where: any = {};
      if (args.status) where.status = args.status;
      if (args.type) where.type = args.type;
      if (args.campaignId) where.campaignId = args.campaignId;
      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: 'insensitive' } },
          { slug: { contains: args.search, mode: 'insensitive' } },
          { title: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.banner.findMany({
          where,
          orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
          skip,
          take: args.limit,
          select: {
            id: true, name: true, slug: true, type: true, status: true, layout: true,
            title: true, body: true, ctaLabel: true, ctaUrl: true,
            targetAllPages: true, targetSlugs: true, excludeSlugs: true,
            delayMs: true, priority: true,
            dismissMode: true, dismissTtlDays: true,
            publishedAt: true, expiresAt: true,
            impressionCount: true, clickCount: true, submissionCount: true,
            notifyEmail: true, campaignId: true,
            createdAt: true, updatedAt: true,
            campaign: { select: { id: true, name: true, slug: true, status: true } },
          },
        }),
        prisma.banner.count({ where }),
      ]);

      const redacted = items.map((b) => redactBanner(b, ctx.elevated));
      await logToolCall({ tool: 'banners-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, banners: redacted });
    }
  );

  // ─────────── banners-get ───────────
  server.registerTool(
    'banners-get',
    {
      description: 'Get a banner by slug or id, including full layoutConfig and targeting rules.',
      inputSchema: {
        slug: z.string().optional(),
        id: z.string().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'banners:read', 'banners-get', args);
      if (deny) return deny;
      if (!args.slug && !args.id) return errorResult('Either `slug` or `id` is required');

      const banner = await prisma.banner.findFirst({
        where: args.slug ? { slug: args.slug } : { id: args.id },
        include: { campaign: true },
      });
      if (!banner) {
        await logToolCall({ tool: 'banners-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Banner not found');
      }
      await logToolCall({ tool: 'banners-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: banner.slug });
      return jsonResult({ banner: redactBanner(banner, ctx.elevated) });
    }
  );

  // ─────────── banner-stats-get ───────────
  server.registerTool(
    'banner-stats-get',
    {
      description:
        'Per-banner stats: total counters + daily timeseries (impressions/clicks/submissions) for the last N days.',
      inputSchema: {
        bannerId: z.string().min(1),
        days: z.number().int().min(1).max(90).default(30),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'banners:read', 'banner-stats-get', args);
      if (deny) return deny;

      const banner = await prisma.banner.findUnique({
        where: { id: args.bannerId },
        select: { id: true, name: true, slug: true, impressionCount: true, clickCount: true, submissionCount: true },
      });
      if (!banner) return errorResult('Banner not found');

      const since = new Date(Date.now() - args.days * 24 * 60 * 60 * 1000);
      const [impressions, clicks, submissions] = await Promise.all([
        prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
          SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
          FROM "BannerImpression" WHERE "bannerId" = ${args.bannerId} AND "createdAt" >= ${since}
          GROUP BY day ORDER BY day ASC
        `,
        prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
          SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
          FROM "BannerClick" WHERE "bannerId" = ${args.bannerId} AND "createdAt" >= ${since}
          GROUP BY day ORDER BY day ASC
        `,
        prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
          SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
          FROM "BannerSubmission" WHERE "bannerId" = ${args.bannerId} AND "createdAt" >= ${since}
          GROUP BY day ORDER BY day ASC
        `,
      ]);

      const toNumeric = (rows: Array<{ day: Date; count: bigint }>) =>
        rows.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) }));

      await logToolCall({ tool: 'banner-stats-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: banner.slug });
      return jsonResult({
        banner,
        sinceIso: since.toISOString(),
        impressions: toNumeric(impressions),
        clicks: toNumeric(clicks),
        submissions: toNumeric(submissions),
      });
    }
  );

  // ─────────── banner-campaigns-list ───────────
  server.registerTool(
    'banner-campaigns-list',
    {
      description: 'List banner campaigns.',
      inputSchema: {
        status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'banners:read', 'banner-campaigns-list', args);
      if (deny) return deny;

      const campaigns = await prisma.bannerCampaign.findMany({
        where: args.status ? { status: args.status } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, slug: true, description: true, status: true, notifyEmail: true,
          createdAt: true, updatedAt: true,
          _count: { select: { banners: true } },
        },
      });
      const redacted = campaigns.map((c) =>
        ctx.elevated ? c : { ...c, notifyEmail: c.notifyEmail ? '<redacted>' : null }
      );
      await logToolCall({ tool: 'banner-campaigns-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${campaigns.length}` });
      return jsonResult({ campaigns: redacted });
    }
  );

  // ─────────── banner-submissions-list ───────────
  server.registerTool(
    'banner-submissions-list',
    {
      description:
        'List banner lead-capture submissions (submissions:read). Contains email + IP + UTM params. Use submissions-export-csv (Phase 3) for bulk download.',
      inputSchema: {
        bannerId: z.string().optional(),
        emailSent: z.boolean().optional(),
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(25),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'submissions:read', 'banner-submissions-list', args);
      if (deny) return deny;

      const where: any = {};
      if (args.bannerId) where.bannerId = args.bannerId;
      if (args.emailSent !== undefined) where.emailSent = args.emailSent;
      if (args.since || args.until) {
        where.createdAt = {};
        if (args.since) where.createdAt.gte = new Date(args.since);
        if (args.until) where.createdAt.lte = new Date(args.until);
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.bannerSubmission.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: args.limit,
          include: { banner: { select: { id: true, name: true, slug: true } } },
        }),
        prisma.bannerSubmission.count({ where }),
      ]);

      const sanitized = items.map((s) => redactBannerSubmission(s, ctx.elevated));
      await logToolCall({ tool: 'banner-submissions-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ elevated: ctx.elevated, pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, submissions: sanitized });
    }
  );
}
