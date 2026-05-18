import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { clearBannersCache } from '@/lib/banners';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';
import {
  mutationCommonFields,
  requireWriteScope,
  requireConfirm,
  auditMutation,
  safeInvalidate,
} from '@/mcp/tools/_write-helpers';

const BannerType = z.enum(['LEAD_CAPTURE', 'CTA']);
const BannerStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const DismissMode = z.enum(['SESSION', 'DAYS', 'FOREVER']);
const CampaignStatus = z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']);

function purgeBannersCache(paths: string[] = ['/']) {
  clearBannersCache();
  return safeInvalidate(paths);
}

export function registerBannersWriteTools(server: McpServer) {
  // ─────────── BannerCampaign CRUD ───────────
  server.registerTool(
    'banner-campaigns-create',
    {
      description: 'Create a banner campaign (groups multiple banners for aggregate stats).',
      inputSchema: {
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        status: CampaignStatus.optional(),
        notifyEmail: z.string().email().optional().describe('Fallback notifyEmail for child banners.'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banner-campaigns-create', args);
      if (deny) return deny;
      const dup = await prisma.bannerCampaign.findUnique({ where: { slug: args.slug } });
      if (dup) return errorResult('A campaign with this slug already exists');
      const { confirm: _c, idempotencyKey: _i, ...data } = args;
      const created = await prisma.bannerCampaign.create({ data: { ...data, status: data.status ?? 'ACTIVE' } });
      await auditMutation({ ctx, tool: 'banner-campaigns-create', action: 'CREATE', entityType: 'BannerCampaign', entityId: created.id, entityName: created.name, details: { slug: created.slug } });
      await purgeBannersCache();
      return jsonResult({ campaign: created });
    }
  );

  server.registerTool(
    'banner-campaigns-update',
    {
      description: 'Update a banner campaign.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().nullable().optional(),
        status: CampaignStatus.optional(),
        notifyEmail: z.string().email().nullable().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banner-campaigns-update', args);
      if (deny) return deny;
      const existing = await prisma.bannerCampaign.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Campaign not found');
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.bannerCampaign.update({ where: { id }, data: patch });
      await auditMutation({ ctx, tool: 'banner-campaigns-update', action: 'UPDATE', entityType: 'BannerCampaign', entityId: id, entityName: updated.name, details: { changes: Object.keys(patch) } });
      await purgeBannersCache();
      return jsonResult({ campaign: updated });
    }
  );

  server.registerTool(
    'banner-campaigns-delete',
    {
      description: 'Delete a banner campaign. Child banners survive with campaignId=null (SetNull). Requires confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banner-campaigns-delete', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `BannerCampaign:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.bannerCampaign.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Campaign not found');
      await prisma.bannerCampaign.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'banner-campaigns-delete', action: 'DELETE', entityType: 'BannerCampaign', entityId: existing.id, entityName: existing.name });
      await purgeBannersCache();
      return jsonResult({ deleted: existing.id });
    }
  );

  // ─────────── Banner CRUD ───────────
  const BannerInputBase = {
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    type: BannerType,
    title: z.string().min(1),
    layout: z.string().optional(),
    layoutConfig: z.any().optional(),
    accentColor: z.string().nullable().optional(),
    backgroundColor: z.string().nullable().optional(),
    textColor: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    imageAlt: z.string().nullable().optional(),
    ctaLabel: z.string().nullable().optional(),
    ctaUrl: z.string().nullable().optional(),
    ctaOpenInNewTab: z.boolean().optional(),
    emailPlaceholder: z.string().nullable().optional(),
    submitLabel: z.string().nullable().optional(),
    successTitle: z.string().nullable().optional(),
    successMessage: z.string().nullable().optional(),
    notifyEmail: z.string().email().nullable().optional(),
    targetAllPages: z.boolean().optional(),
    targetSlugs: z.array(z.string()).optional(),
    excludeSlugs: z.array(z.string()).optional(),
    delayMs: z.number().int().min(0).max(60_000).optional(),
    utmRules: z.any().optional(),
    refererRules: z.any().optional(),
    dismissMode: DismissMode.optional(),
    dismissTtlDays: z.number().int().min(0).max(365).nullable().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    priority: z.number().int().optional(),
    campaignId: z.string().nullable().optional(),
  };

  server.registerTool(
    'banners-create',
    {
      description: 'Create a popup banner. Default status=DRAFT — use banners-publish to activate.',
      inputSchema: { ...BannerInputBase, ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banners-create', args);
      if (deny) return deny;
      const dup = await prisma.banner.findUnique({ where: { slug: args.slug } });
      if (dup) return errorResult('A banner with this slug already exists');
      const { confirm: _c, idempotencyKey: _i, publishedAt, expiresAt, ...rest } = args;
      const created = await prisma.banner.create({
        data: {
          ...rest,
          publishedAt: publishedAt ? new Date(publishedAt) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          status: 'DRAFT',
        } as any,
      });
      await auditMutation({ ctx, tool: 'banners-create', action: 'CREATE', entityType: 'Banner', entityId: created.id, entityName: created.slug, details: { type: created.type, layout: created.layout } });
      await purgeBannersCache();
      return jsonResult({ banner: created });
    }
  );

  server.registerTool(
    'banners-update',
    {
      description: 'Update a banner (partial). Use banners-publish for status transitions.',
      inputSchema: {
        id: z.string().min(1),
        ...Object.fromEntries(Object.entries(BannerInputBase).map(([k, v]) => [k, (v as any).optional()])),
        ...mutationCommonFields,
      },
    },
    async (args: any, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banners-update', args);
      if (deny) return deny;
      const existing = await prisma.banner.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Banner not found');
      const { id, confirm: _c, idempotencyKey: _i, publishedAt, expiresAt, ...patch } = args;
      const data: any = { ...patch };
      if (publishedAt !== undefined) data.publishedAt = publishedAt ? new Date(publishedAt) : null;
      if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;
      const updated = await prisma.banner.update({ where: { id }, data });
      await auditMutation({ ctx, tool: 'banners-update', action: 'UPDATE', entityType: 'Banner', entityId: id, entityName: updated.slug, details: { changes: Object.keys(patch) } });
      await purgeBannersCache();
      return jsonResult({ banner: updated });
    }
  );

  server.registerTool(
    'banners-publish',
    {
      description: 'Transition a banner between DRAFT / PUBLISHED / ARCHIVED. Optionally set publishedAt / expiresAt. Requires banners:publish + confirm:true.',
      inputSchema: {
        id: z.string().min(1),
        status: BannerStatus,
        publishedAt: z.string().datetime().nullable().optional(),
        expiresAt: z.string().datetime().nullable().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:publish', 'banners-publish', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, `transition to ${args.status}`, `Banner:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.banner.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Banner not found');
      const data: any = { status: args.status };
      if (args.publishedAt !== undefined) data.publishedAt = args.publishedAt ? new Date(args.publishedAt) : null;
      if (args.expiresAt !== undefined) data.expiresAt = args.expiresAt ? new Date(args.expiresAt) : null;
      if (args.status === 'PUBLISHED' && !existing.publishedAt && data.publishedAt === undefined) data.publishedAt = new Date();
      const updated = await prisma.banner.update({ where: { id: args.id }, data });
      await auditMutation({ ctx, tool: 'banners-publish', action: 'UPDATE', entityType: 'Banner', entityId: updated.id, entityName: updated.slug, details: { from: existing.status, to: updated.status } });
      await purgeBannersCache();
      return jsonResult({ banner: updated });
    }
  );

  server.registerTool(
    'banners-delete',
    {
      description: 'Delete a banner (cascade deletes impressions/clicks/submissions). Requires confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banners-delete', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `Banner:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.banner.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Banner not found');
      await prisma.banner.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'banners-delete', action: 'DELETE', entityType: 'Banner', entityId: existing.id, entityName: existing.slug });
      await purgeBannersCache();
      return jsonResult({ deleted: existing.id });
    }
  );

  server.registerTool(
    'banners-duplicate',
    {
      description: 'Clone an existing banner under a new slug (status=DRAFT, counters reset). Mirrors /admin/banners/[id]/duplicate.',
      inputSchema: {
        id: z.string().min(1),
        newSlug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        newName: z.string().optional().describe('Defaults to "<original name> (copy)"'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'banners:write', 'banners-duplicate', args);
      if (deny) return deny;
      const slugConflict = await prisma.banner.findUnique({ where: { slug: args.newSlug } });
      if (slugConflict) return errorResult('newSlug already in use');
      const src = await prisma.banner.findUnique({ where: { id: args.id } });
      if (!src) return errorResult('Source banner not found');
      const { id: _id, createdAt: _ca, updatedAt: _ua, impressionCount: _i, clickCount: _c, submissionCount: _s, slug: _sl, name: _n, ...copyFields } = src;
      const created = await prisma.banner.create({
        data: {
          ...copyFields,
          slug: args.newSlug,
          name: args.newName ?? `${src.name} (copy)`,
          status: 'DRAFT',
          impressionCount: 0,
          clickCount: 0,
          submissionCount: 0,
        } as any,
      });
      await auditMutation({ ctx, tool: 'banners-duplicate', action: 'CREATE', entityType: 'Banner', entityId: created.id, entityName: created.slug, details: { duplicatedFrom: src.id } });
      await purgeBannersCache();
      return jsonResult({ banner: created });
    }
  );
}
