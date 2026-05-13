import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { effectiveMode } from '@/mcp/scope-guard';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, requireScope, type ExtraContext } from '@/mcp/tools/_helpers';

export function registerCmsTools(server: McpServer) {
  // ─────────── cms-list-pages ───────────
  server.registerTool(
    'cms-list-pages',
    {
      description:
        'List CMS pages. Public mode shows only published pages; cms:read sees drafts too. Returns slug, title, status, type, updatedAt + section count.',
      inputSchema: {
        type: z.enum(['CORE', 'CUSTOM', 'INDUSTRY']).optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'cms');
      if (!mode) {
        await logToolCall({ tool: 'cms-list-pages', scopes: ctx.scopes, status: 'forbidden', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args });
        return errorResult('Forbidden: Requires cms:read or public:cms');
      }

      const where: any = {};
      if (mode === 'public') where.status = 'published';
      if (args.type) where.type = args.type;
      if (args.search) {
        where.OR = [
          { slug: { contains: args.search, mode: 'insensitive' } },
          { title: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.page.findMany({
          where,
          orderBy: [{ updatedAt: 'desc' }],
          skip,
          take: args.limit,
          select: {
            id: true,
            slug: true,
            title: true,
            description: mode === 'admin',
            ogImage: true,
            status: mode === 'admin',
            type: true,
            updatedAt: true,
            createdAt: mode === 'admin',
            _count: { select: { sections: true } },
          },
        }),
        prisma.page.count({ where }),
      ]);

      await logToolCall({ tool: 'cms-list-pages', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ mode, pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, pages: items });
    }
  );

  // ─────────── cms-get-page ───────────
  server.registerTool(
    'cms-get-page',
    {
      description:
        'Get a CMS page by slug, including its sections (with section type + data JSON) in display order. Public mode skips draft pages.',
      inputSchema: { slug: z.string().min(1) },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'cms');
      if (!mode) return errorResult('Forbidden: Requires cms:read or public:cms');

      const where: any = { slug: args.slug };
      if (mode === 'public') where.status = 'published';

      const page = await prisma.page.findFirst({
        where,
        include: {
          sections: {
            orderBy: { position: 'asc' },
            include: {
              section: {
                select: {
                  id: true, type: true, data: true,
                  sharedSection: { select: { id: true, name: true, type: true } },
                },
              },
            },
          },
        },
      });
      if (!page) {
        await logToolCall({ tool: 'cms-get-page', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Page not found');
      }
      await logToolCall({ tool: 'cms-get-page', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: page.slug });
      return jsonResult({ mode, page });
    }
  );

  // ─────────── cms-list-shared-sections ───────────
  server.registerTool(
    'cms-list-shared-sections',
    {
      description:
        'List reusable shared sections (cms:read). Anonymous callers do not see this list — drafts of shared sections are admin-only.',
      inputSchema: {
        type: z.string().optional().describe('Filter by SectionType enum'),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'cms:read', 'cms-list-shared-sections', args);
      if (deny) return deny;

      const sections = await prisma.sharedSection.findMany({
        where: args.type ? { type: args.type as any } : undefined,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, name: true, type: true, description: true, data: true,
          createdAt: true, updatedAt: true,
          _count: { select: { sections: true } },
        },
      });
      await logToolCall({ tool: 'cms-list-shared-sections', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${sections.length}` });
      return jsonResult({ sections });
    }
  );
}
