import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { effectiveMode, forbidden } from '@/mcp/scope-guard';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';

export function registerCatalogTools(server: McpServer) {
  // ─────────── catalog-list-products ───────────
  server.registerTool(
    'catalog-list-products',
    {
      description:
        'List products with optional filters (code/manufacturer search, brand, category, filter type, status). ' +
        'Anonymous (public:catalog) callers see only products with non-archived status; tokens with catalog:read see all (including drafts).',
      inputSchema: {
        search: z.string().optional().describe('Substring match against product code or manufacturer name (case-insensitive)'),
        brandId: z.string().optional(),
        categoryId: z.string().optional(),
        filterTypeId: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'catalog');
      if (!mode) {
        await logToolCall({ tool: 'catalog-list-products', scopes: ctx.scopes, status: 'forbidden', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args });
        return forbidden('Requires catalog:read or public:catalog');
      }

      const where: any = {};
      if (args.search) {
        where.OR = [
          { code: { contains: args.search, mode: 'insensitive' } },
          { manufacturer: { contains: args.search, mode: 'insensitive' } },
        ];
      }
      if (args.brandId) where.brandId = args.brandId;
      if (args.categoryId) where.categories = { some: { categoryId: args.categoryId } };
      if (args.filterTypeId) where.filterTypeId = args.filterTypeId;
      if (args.status) where.status = args.status;
      if (mode === 'public') {
        // Hide archived/draft items from anonymous callers
        where.NOT = [{ status: 'ARCHIVED' }, { status: 'DRAFT' }];
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: [{ code: 'asc' }],
          skip,
          take: args.limit,
          select: {
            id: true,
            code: true,
            name: true,
            description: mode === 'admin',
            manufacturer: true,
            status: mode === 'admin',
            tags: mode === 'admin',
            industries: true,
            brand: { select: { id: true, name: true } },
            filterType: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.product.count({ where }),
      ]);

      const payload = {
        mode,
        pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) },
        products: items,
      };
      await logToolCall({ tool: 'catalog-list-products', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult(payload);
    }
  );

  // ─────────── catalog-get-product ───────────
  server.registerTool(
    'catalog-get-product',
    {
      description: 'Get a product by code (preferred) or id, including specs, media, cross-references.',
      inputSchema: {
        code: z.string().optional(),
        id: z.string().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'catalog');
      if (!mode) return forbidden('Requires catalog:read or public:catalog');
      if (!args.code && !args.id) {
        return errorResult('Either `code` or `id` is required');
      }

      const where: any = args.code ? { code: args.code } : { id: args.id };
      if (mode === 'public') {
        where.NOT = [{ status: 'ARCHIVED' }, { status: 'DRAFT' }];
      }

      const product = await prisma.product.findFirst({
        where,
        include: {
          brand: true,
          filterType: { select: { id: true, name: true, slug: true } },
          categories: { include: { category: true }, orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
          specValues: { include: { parameter: true }, orderBy: { position: 'asc' } },
          media: { include: { asset: { select: { id: true, s3Path: true, cdnUrl: true, altText: true } } }, orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
          crossReferences: { orderBy: [{ isPreferred: 'desc' }, { refBrandName: 'asc' }] },
        },
      });

      if (!product) {
        await logToolCall({ tool: 'catalog-get-product', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Product not found');
      }

      await logToolCall({ tool: 'catalog-get-product', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: product.code });
      return jsonResult({ mode, product });
    }
  );

  // ─────────── catalog-list-brands ───────────
  server.registerTool(
    'catalog-list-brands',
    {
      description: 'List brands. Public callers see only active brands; admin scope sees all.',
      inputSchema: {},
    },
    async (_args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'catalog');
      if (!mode) return forbidden('Requires catalog:read or public:catalog');

      const brands = await prisma.brand.findMany({
        where: mode === 'public' ? { isActive: true } : undefined,
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, code: true, description: true, logoUrl: true, website: true, isActive: true, position: true },
      });
      await logToolCall({ tool: 'catalog-list-brands', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, resultSummary: `${brands.length}` });
      return jsonResult({ mode, brands });
    }
  );

  // ─────────── catalog-list-categories ───────────
  server.registerTool(
    'catalog-list-categories',
    {
      description: 'List product categories.',
      inputSchema: {},
    },
    async (_args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'catalog');
      if (!mode) return forbidden('Requires catalog:read or public:catalog');

      const categories = await prisma.productCategory.findMany({
        where: mode === 'public' ? { isActive: true } : undefined,
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, description: true, icon: true, position: true, isActive: true },
      });
      await logToolCall({ tool: 'catalog-list-categories', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, resultSummary: `${categories.length}` });
      return jsonResult({ mode, categories });
    }
  );

  // ─────────── catalog-list-filter-types ───────────
  server.registerTool(
    'catalog-list-filter-types',
    {
      description: 'List product filter types (Air, Oil, Fuel, Cabin, etc.) for the product schema.',
      inputSchema: {},
    },
    async (_args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'catalog');
      if (!mode) return forbidden('Requires catalog:read or public:catalog');

      const types = await prisma.productFilterType.findMany({
        where: mode === 'public' ? { isActive: true } : undefined,
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, code: true, description: true, icon: true, isActive: true, position: true },
      });
      await logToolCall({ tool: 'catalog-list-filter-types', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, resultSummary: `${types.length}` });
      return jsonResult({ mode, filterTypes: types });
    }
  );

  // ─────────── catalog-list-spec-parameters ───────────
  server.registerTool(
    'catalog-list-spec-parameters',
    {
      description: 'List spec parameters that products can be measured against (e.g. outer diameter, height).',
      inputSchema: {
        category: z.string().optional().describe('Filter by spec category'),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const mode = effectiveMode(ctx.scopes, 'catalog');
      if (!mode) return forbidden('Requires catalog:read or public:catalog');

      const params = await prisma.specParameter.findMany({
        where: {
          ...(mode === 'public' ? { isActive: true } : {}),
          ...(args.category ? { category: args.category } : {}),
        },
        orderBy: [{ category: 'asc' }, { position: 'asc' }, { name: 'asc' }],
        select: { id: true, code: true, name: true, unit: true, category: true, position: true, isActive: true },
      });
      await logToolCall({ tool: 'catalog-list-spec-parameters', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${params.length}` });
      return jsonResult({ mode, specParameters: params });
    }
  );
}
