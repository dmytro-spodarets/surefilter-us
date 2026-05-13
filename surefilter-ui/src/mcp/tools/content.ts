import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { effectiveMode, forbidden } from '@/mcp/scope-guard';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';

function publishedFilter() {
  return { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } };
}

export function registerContentTools(server: McpServer) {
  // ─────────── content-list-news ───────────
  server.registerTool(
    'content-list-news',
    {
      description:
        'List news / events with optional filters. Public callers see only PUBLISHED items with publishedAt <= now; ' +
        'content:read sees drafts and archived items too.',
      inputSchema: {
        type: z.enum(['NEWS', 'EVENT']).optional(),
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'content');
      if (!mode) {
        await logToolCall({ tool: 'content-list-news', scopes: ctx.scopes, status: 'forbidden', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args });
        return forbidden('Requires content:read or public:content');
      }

      const where: any = {};
      if (mode === 'public') Object.assign(where, publishedFilter());
      if (args.type) where.type = args.type;
      if (args.categorySlug) where.category = { slug: args.categorySlug, isActive: true };
      if (args.search) {
        where.OR = [
          { title: { contains: args.search, mode: 'insensitive' } },
          { excerpt: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.newsArticle.findMany({
          where,
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: args.limit,
          select: {
            id: true,
            slug: true,
            type: true,
            title: true,
            excerpt: true,
            featuredImage: true,
            featuredImageAlt: true,
            tags: true,
            author: true,
            publishedAt: true,
            status: mode === 'admin',
            eventStartDate: true,
            eventEndDate: true,
            location: true,
            booth: true,
            isFeatured: true,
            category: { select: { id: true, name: true, slug: true, color: true } },
          },
        }),
        prisma.newsArticle.count({ where }),
      ]);

      await logToolCall({ tool: 'content-list-news', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ mode, pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, items });
    }
  );

  // ─────────── content-get-news ───────────
  server.registerTool(
    'content-get-news',
    {
      description: 'Get a single news / event article by slug.',
      inputSchema: { slug: z.string().min(1) },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'content');
      if (!mode) return forbidden('Requires content:read or public:content');

      const where: any = { slug: args.slug };
      if (mode === 'public') Object.assign(where, publishedFilter());

      const article = await prisma.newsArticle.findFirst({
        where,
        include: { category: true },
      });
      if (!article) {
        await logToolCall({ tool: 'content-get-news', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Article not found');
      }
      await logToolCall({ tool: 'content-get-news', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: article.slug });
      return jsonResult({ mode, article });
    }
  );

  // ─────────── content-list-resource-categories ───────────
  server.registerTool(
    'content-list-resource-categories',
    {
      description:
        'List resource categories. By default returns a tree of top-level categories with nested children + ' +
        'published-resource counts (mirrors GET /api/resources/categories). Pass flat=true for a flat list.',
      inputSchema: {
        flat: z.boolean().optional().default(false),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'content');
      if (!mode) return forbidden('Requires content:read or public:content');

      if (args.flat) {
        const cats = await prisma.resourceCategory.findMany({
          where: mode === 'public' ? { isActive: true } : undefined,
          orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { name: 'asc' }],
          select: {
            id: true, name: true, slug: true, description: true, image: true, icon: true, color: true,
            position: true, isActive: true, parentId: true,
            parent: { select: { id: true, name: true, slug: true } },
            _count: { select: { resources: true, children: true } },
          },
        });
        await logToolCall({ tool: 'content-list-resource-categories', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${cats.length}` });
        return jsonResult({ mode, flat: true, categories: cats });
      }

      const tree = await prisma.resourceCategory.findMany({
        where: { ...(mode === 'public' ? { isActive: true } : {}), parentId: null },
        orderBy: { position: 'asc' },
        include: {
          _count: { select: { resources: mode === 'public' ? { where: publishedFilter() } as any : true } },
          children: {
            where: mode === 'public' ? { isActive: true } : undefined,
            orderBy: { position: 'asc' },
            include: {
              _count: { select: { resources: mode === 'public' ? { where: publishedFilter() } as any : true } },
            },
          },
        },
      });
      await logToolCall({ tool: 'content-list-resource-categories', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${tree.length}` });
      return jsonResult({ mode, flat: false, categories: tree });
    }
  );

  // ─────────── content-list-resources ───────────
  server.registerTool(
    'content-list-resources',
    {
      description:
        'List resources (catalogs / documents). Filters: `category` (top-level OR subcategory slug — includes resources from descendants when top-level), `subcategory` (exact match on child slug), `search`.',
      inputSchema: {
        category: z.string().optional(),
        subcategory: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'content');
      if (!mode) return forbidden('Requires content:read or public:content');

      const filters: any[] = [];
      if (args.subcategory) {
        filters.push({
          category: {
            slug: args.subcategory,
            isActive: true,
            ...(args.category ? { parent: { slug: args.category, isActive: true } } : {}),
          },
        });
      } else if (args.category) {
        filters.push({
          OR: [
            { category: { slug: args.category, isActive: true } },
            { category: { isActive: true, parent: { slug: args.category, isActive: true } } },
          ],
        });
      }
      if (args.search) {
        filters.push({
          OR: [
            { title: { contains: args.search, mode: 'insensitive' } },
            { description: { contains: args.search, mode: 'insensitive' } },
            { shortDescription: { contains: args.search, mode: 'insensitive' } },
          ],
        });
      }
      const where: any = {
        ...(mode === 'public' ? publishedFilter() : {}),
        ...(filters.length > 0 ? { AND: filters } : {}),
      };

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.resource.findMany({
          where,
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: args.limit,
          select: {
            id: true, slug: true, title: true, shortDescription: true, thumbnailImage: true,
            file: true, fileType: true, fileSize: true, fileMeta: true,
            allowDirectDownload: true, allowPreview: true,
            publishedAt: true, status: mode === 'admin',
            category: {
              select: {
                id: true, name: true, slug: true, color: true, icon: true,
                parent: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        }),
        prisma.resource.count({ where }),
      ]);

      await logToolCall({ tool: 'content-list-resources', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ mode, pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, items });
    }
  );

  // ─────────── content-get-resource ───────────
  server.registerTool(
    'content-get-resource',
    {
      description:
        'Get a resource by slug. Optionally constrain via `categorySlug` (top-level OR subcategory) and `parentCategorySlug` for fully-qualified subcategory paths.',
      inputSchema: {
        slug: z.string().min(1),
        categorySlug: z.string().optional(),
        parentCategorySlug: z.string().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'content');
      if (!mode) return forbidden('Requires content:read or public:content');

      const where: any = { slug: args.slug };
      if (mode === 'public') Object.assign(where, publishedFilter());
      if (args.categorySlug) {
        where.category = {
          slug: args.categorySlug,
          isActive: true,
          ...(args.parentCategorySlug ? { parent: { slug: args.parentCategorySlug, isActive: true } } : {}),
        };
      }

      const resource = await prisma.resource.findFirst({
        where,
        include: {
          category: { include: { parent: { select: { id: true, name: true, slug: true } } } },
          form: { select: { id: true, slug: true, name: true } },
        },
      });
      if (!resource) {
        await logToolCall({ tool: 'content-get-resource', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Resource not found');
      }

      // Build canonical public URL
      const parentSlug = resource.category?.parent?.slug;
      const catSlug = resource.category?.slug;
      const url = parentSlug && catSlug
        ? `/resources/${parentSlug}/${catSlug}/${resource.slug}`
        : catSlug
          ? `/resources/${catSlug}/${resource.slug}`
          : null;

      await logToolCall({ tool: 'content-get-resource', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: resource.slug });
      return jsonResult({ mode, resource, publicUrl: url });
    }
  );
}
