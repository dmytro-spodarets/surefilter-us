import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { hasScope } from '@/lib/api-token';
import { McpSettingsSchema, getMcpSettings, updateMcpSettings } from '@/lib/mcp-settings';
import { authContext, jsonResult, errorResult, textResult, type ExtraContext } from '@/mcp/tools/_helpers';
import {
  mutationCommonFields,
  requireWriteScope,
  requireConfirm,
  auditMutation,
  safeInvalidate,
} from '@/mcp/tools/_write-helpers';

/**
 * Field set for SiteSettings updates. Mirrors the admin web UI payload but only
 * exposes safe-to-mutate top-level fields — the catalog password and MCP block
 * remain editable via their own dedicated paths.
 */
const SiteSettingsPatch = z.object({
  logoUrl: z.string().nullable().optional(),
  newsroomTitle: z.string().nullable().optional(),
  newsroomDescription: z.string().nullable().optional(),
  newsroomHeroImage: z.string().nullable().optional(),
  newsroomHeroColor: z.string().nullable().optional(),
  newsroomMetaTitle: z.string().nullable().optional(),
  newsroomMetaDesc: z.string().nullable().optional(),
  newsroomOgImage: z.string().nullable().optional(),
  newsArticleTitle: z.string().nullable().optional(),
  newsArticleDescription: z.string().nullable().optional(),
  newsArticleHeroImage: z.string().nullable().optional(),
  eventArticleTitle: z.string().nullable().optional(),
  eventArticleDescription: z.string().nullable().optional(),
  eventArticleHeroImage: z.string().nullable().optional(),
  resourcesTitle: z.string().nullable().optional(),
  resourcesDescription: z.string().nullable().optional(),
  resourcesHeroImage: z.string().nullable().optional(),
  resourcesMetaTitle: z.string().nullable().optional(),
  resourcesMetaDesc: z.string().nullable().optional(),
  resourcesOgImage: z.string().nullable().optional(),
  headerNavigation: z.any().optional(),
  footerContent: z.any().optional(),
  catalogPassword: z.string().nullable().optional(),
  catalogPasswordEnabled: z.boolean().optional(),
  formNotificationFromEmail: z.string().email().nullable().optional(),
  gaMeasurementId: z.string().nullable().optional(),
  gtmId: z.string().nullable().optional(),
  termlyWebsiteUUID: z.string().nullable().optional(),
  seoRobotsBlock: z.boolean().optional(),
  llmsSiteDescription: z.string().nullable().optional(),
  defaultMetaTitle: z.string().nullable().optional(),
  defaultMetaTitleSuffix: z.string().nullable().optional(),
  defaultMetaDesc: z.string().nullable().optional(),
  defaultMetaKeywords: z.string().nullable().optional(),
  redirects: z.any().optional(),
});

export function registerAdminWriteTools(server: McpServer) {
  // ─────────── settings-update ───────────
  server.registerTool(
    'settings-update',
    {
      description:
        'Update SiteSettings (and optionally MCP server settings). Requires settings:write AND admin:* AND confirm:true. Mutates global site behavior — title bars, redirects, header/footer, analytics ids, etc.',
      inputSchema: {
        site: SiteSettingsPatch.partial().optional().describe('SiteSettings field patch'),
        mcp: McpSettingsSchema.partial().optional().describe('MCP server settings patch (stored in SiteSettings.mcp JSON)'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const safeParams = {
        ...args,
        site: args.site ? { ...args.site, catalogPassword: args.site.catalogPassword === undefined ? undefined : '<redacted>' } : undefined,
      };
      const deny = await requireWriteScope(ctx, 'settings:write', 'settings-update', safeParams);
      if (deny) return deny;
      if (!hasScope(ctx.scopes, 'admin:*')) {
        return errorResult('settings-update is restricted to tokens with admin:* (not just settings:write).');
      }
      const needConfirm = requireConfirm(args, 'update SiteSettings', 'SiteSettings');
      if (needConfirm) return needConfirm;
      if (!args.site && !args.mcp) return errorResult('Provide at least one of `site` or `mcp`');

      let updatedSite: any = null;
      if (args.site) {
        updatedSite = await prisma.siteSettings.upsert({
          where: { id: 'site_settings' },
          create: { id: 'site_settings', ...args.site },
          update: args.site,
        });
      }
      let updatedMcp = null;
      if (args.mcp) {
        updatedMcp = await updateMcpSettings(args.mcp);
      } else {
        updatedMcp = await getMcpSettings();
      }

      await auditMutation({
        ctx, tool: 'settings-update', action: 'UPDATE',
        entityType: 'SiteSettings', entityId: 'site_settings', entityName: 'SiteSettings',
        details: { siteKeys: args.site ? Object.keys(args.site) : [], mcpKeys: args.mcp ? Object.keys(args.mcp) : [] },
        params: safeParams,
      });

      // SiteSettings affects every page → invalidate everything.
      await safeInvalidate(['/']);

      return jsonResult({
        site: updatedSite ? { ...updatedSite, catalogPassword: updatedSite.catalogPassword ? '<redacted>' : null } : null,
        mcp: updatedMcp,
      });
    }
  );

  // ─────────── submissions-export-csv ───────────
  server.registerTool(
    'submissions-export-csv',
    {
      description:
        'Export form OR banner submissions as CSV. Choose either `formId/formSlug` for form submissions, or `bannerId/bannerSlug` for banner leads. Contains PII (email/IP). Requires submissions:export.',
      inputSchema: {
        kind: z.enum(['form', 'banner']),
        formId: z.string().optional(),
        formSlug: z.string().optional(),
        bannerId: z.string().optional(),
        bannerSlug: z.string().optional(),
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(10_000).default(1000),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'submissions:export', 'submissions-export-csv', args);
      if (deny) return deny;

      if (args.kind === 'form') {
        const where: any = {};
        if (args.formId) where.formId = args.formId;
        if (args.formSlug) where.form = { slug: args.formSlug };
        if (args.since || args.until) {
          where.createdAt = {};
          if (args.since) where.createdAt.gte = new Date(args.since);
          if (args.until) where.createdAt.lte = new Date(args.until);
        }
        const rows = await prisma.formSubmission.findMany({
          where, orderBy: { createdAt: 'desc' }, take: args.limit,
          include: { form: { select: { slug: true, name: true } } },
        });
        const csv = formCsv(rows);
        await auditMutation({
          ctx, tool: 'submissions-export-csv', action: 'CREATE',
          entityType: 'FormSubmission', entityId: 'export', entityName: `${rows.length} rows`,
          details: { kind: 'form', filters: args, count: rows.length },
          params: args,
        });
        return textResult(csv);
      } else {
        const where: any = {};
        if (args.bannerId) where.bannerId = args.bannerId;
        if (args.bannerSlug) where.banner = { slug: args.bannerSlug };
        if (args.since || args.until) {
          where.createdAt = {};
          if (args.since) where.createdAt.gte = new Date(args.since);
          if (args.until) where.createdAt.lte = new Date(args.until);
        }
        const rows = await prisma.bannerSubmission.findMany({
          where, orderBy: { createdAt: 'desc' }, take: args.limit,
          include: { banner: { select: { slug: true, name: true } } },
        });
        const csv = bannerCsv(rows);
        await auditMutation({
          ctx, tool: 'submissions-export-csv', action: 'CREATE',
          entityType: 'BannerSubmission', entityId: 'export', entityName: `${rows.length} rows`,
          details: { kind: 'banner', filters: args, count: rows.length },
          params: args,
        });
        return textResult(csv);
      }
    }
  );
}

// ─────────────────── CSV helpers ───────────────────
function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formCsv(rows: Array<{ id: string; createdAt: Date; form: { slug: string; name: string } | null; data: any; ipAddress: string | null; emailSent: boolean; webhookSent: boolean }>): string {
  const header = ['id', 'createdAt', 'formSlug', 'formName', 'data', 'ipAddress', 'emailSent', 'webhookSent'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.id, r.createdAt.toISOString(), r.form?.slug ?? '', r.form?.name ?? '', r.data, r.ipAddress ?? '', r.emailSent, r.webhookSent].map(escapeCsv).join(','));
  }
  return lines.join('\n');
}

function bannerCsv(rows: Array<{ id: string; createdAt: Date; banner: { slug: string; name: string } | null; email: string; pageUrl: string | null; utmParams: any; referer: string | null; ipAddress: string | null; emailSent: boolean }>): string {
  const header = ['id', 'createdAt', 'bannerSlug', 'bannerName', 'email', 'pageUrl', 'utmParams', 'referer', 'ipAddress', 'emailSent'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.id, r.createdAt.toISOString(), r.banner?.slug ?? '', r.banner?.name ?? '', r.email, r.pageUrl ?? '', r.utmParams, r.referer ?? '', r.ipAddress ?? '', r.emailSent].map(escapeCsv).join(','));
  }
  return lines.join('\n');
}
