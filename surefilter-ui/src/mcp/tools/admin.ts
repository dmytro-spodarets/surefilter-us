import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { getMcpSettings } from '@/lib/mcp-settings';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, requireScope, type ExtraContext } from '@/mcp/tools/_helpers';

const ADMIN_ACTIONS = [
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
  'TOKEN_CREATED', 'TOKEN_REVOKED', 'TOKEN_REGENERATED',
  'MCP_TOOL_CALL', 'MCP_SETTINGS_UPDATED',
] as const;

export function registerAdminTools(server: McpServer) {
  // ─────────── settings-get ───────────
  server.registerTool(
    'settings-get',
    {
      description:
        'Read SiteSettings (settings:read). Sensitive fields (catalogPassword) are redacted unless the calling token carries admin:*. Includes MCP server config from SiteSettings.mcp.',
      inputSchema: {},
    },
    async (_args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'settings:read', 'settings-get');
      if (deny) return deny;

      const settings = await prisma.siteSettings.findUnique({ where: { id: 'site_settings' } });
      const mcp = await getMcpSettings();

      const shaped = settings
        ? {
            ...settings,
            catalogPassword: ctx.elevated ? settings.catalogPassword : settings.catalogPassword ? '<redacted>' : null,
            mcp,
          }
        : null;

      await logToolCall({ tool: 'settings-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, resultSummary: shaped ? 'ok' : 'missing' });
      return shaped ? jsonResult({ elevated: ctx.elevated, settings: shaped }) : errorResult('SiteSettings row missing — seed admin first');
    }
  );

  // ─────────── analytics-logs-list ───────────
  server.registerTool(
    'analytics-logs-list',
    {
      description:
        'List AdminLog entries (analytics:read). Filters by user, action, entity type, date range. Useful for auditing MCP_TOOL_CALL activity per token.',
      inputSchema: {
        userId: z.string().optional(),
        action: z.enum(ADMIN_ACTIONS).optional(),
        entityType: z.string().optional(),
        entityId: z.string().optional(),
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(200).default(50),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'analytics:read', 'analytics-logs-list', args);
      if (deny) return deny;

      const where: any = {};
      if (args.userId) where.userId = args.userId;
      if (args.action) where.action = args.action;
      if (args.entityType) where.entityType = args.entityType;
      if (args.entityId) where.entityId = args.entityId;
      if (args.since || args.until) {
        where.createdAt = {};
        if (args.since) where.createdAt.gte = new Date(args.since);
        if (args.until) where.createdAt.lte = new Date(args.until);
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.adminLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: args.limit,
          select: {
            id: true, userId: true, action: true, entityType: true, entityId: true, entityName: true,
            details: true, ipAddress: true, userAgent: true, createdAt: true,
          },
        }),
        prisma.adminLog.count({ where }),
      ]);

      await logToolCall({ tool: 'analytics-logs-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, logs: items });
    }
  );
}
