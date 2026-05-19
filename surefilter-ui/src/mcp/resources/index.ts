import 'server-only';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { effectiveMode } from '@/mcp/scope-guard';

type ExtraContext = { authInfo?: { scopes: string[]; clientId: string; extra?: any } };

function getScopes(extra: ExtraContext): string[] {
  return extra.authInfo?.scopes ?? [];
}

function jsonContents(uri: string, payload: unknown) {
  return {
    contents: [
      {
        uri,
        mimeType: 'application/json' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function textContents(uri: string, text: string) {
  return {
    contents: [
      { uri, mimeType: 'text/markdown' as const, text },
    ],
  };
}

const API_OVERVIEW_MD = `# Sure Filter MCP API Overview

This MCP server (mcp.surefilter.us, May 2026) exposes a curated subset of the
Sure Filter US CMS to AI agents.

## Anonymous access (no token)

When called without an Authorization header, the server grants:
- public:catalog  — read published products / brands / categories / filter types / spec parameters
- public:content  — read published news / events / resources / resource categories
- public:cms      — read published CMS pages (Phase 2+)

Anonymous calls are rate-limited (60/min per IP).

## Authenticated access (Bearer token)

Tokens are issued in the admin at /admin/settings/tokens with scopes such as
catalog:read, content:write, banners:publish, admin:*. See the Scopes
Reference page in the admin for the full vocabulary.

Submit the token as: \`Authorization: Bearer sfpat_…\`.

## Resource URL conventions

Resources may live under a flat top-level category OR a subcategory (max
depth = 2):
- /resources/{categorySlug}/{resourceSlug}              — flat top-level
- /resources/{parentSlug}/{categorySlug}/{resourceSlug} — under subcategory

Use \`content-list-resource-categories\` to discover the hierarchy and
\`content-get-resource\` to receive a \`publicUrl\` field with the resolved URL.

## Phases

- Phase 1 (this server): public + admin read for catalog + content.
- Phase 2: admin read for CMS, forms, banners, media, users.
- Phase 3: writes (create/update/delete/publish) — destructive ops require
  \`confirm: true\` or MCP Elicitation.
`;

export function registerMcpResources(server: McpServer) {
  // ─────────── sf://catalog/index ───────────
  server.registerResource(
    'catalog-index',
    'sf://catalog/index',
    {
      title: 'Catalog index',
      description: 'Compact snapshot of brands / categories / filter types — useful for grounding agent prompts.',
      mimeType: 'application/json',
    },
    async (uri, extra) => {
      const mode = effectiveMode(getScopes(extra as ExtraContext), 'catalog');
      if (!mode) return jsonContents(uri.href, { error: 'forbidden', requires: 'catalog:read or public:catalog' });
      const where = mode === 'public' ? { isActive: true } : undefined;
      const [brands, categories, filterTypes] = await Promise.all([
        prisma.brand.findMany({ where, orderBy: [{ position: 'asc' }, { name: 'asc' }], select: { id: true, name: true, code: true } }),
        prisma.productCategory.findMany({ where, orderBy: [{ position: 'asc' }, { name: 'asc' }], select: { id: true, name: true, slug: true } }),
        prisma.productFilterType.findMany({ where, orderBy: [{ position: 'asc' }, { name: 'asc' }], select: { id: true, name: true, slug: true, code: true } }),
      ]);
      return jsonContents(uri.href, { mode, brands, categories, filterTypes });
    }
  );

  // ─────────── sf://content/news-feed ───────────
  server.registerResource(
    'content-news-feed',
    'sf://content/news-feed',
    {
      title: 'Recent news feed',
      description: 'Latest published news + events (top 20).',
      mimeType: 'application/json',
    },
    async (uri, extra) => {
      const mode = effectiveMode(getScopes(extra as ExtraContext), 'content');
      if (!mode) return jsonContents(uri.href, { error: 'forbidden', requires: 'content:read or public:content' });
      const where = mode === 'public' ? { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } } : undefined;
      const items = await prisma.newsArticle.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: 20,
        select: {
          id: true, slug: true, type: true, title: true, excerpt: true, publishedAt: true,
          eventStartDate: true, location: true, isFeatured: true,
          category: { select: { name: true, slug: true } },
        },
      });
      return jsonContents(uri.href, { mode, items });
    }
  );

  // ─────────── sf://content/resources-tree ───────────
  server.registerResource(
    'content-resources-tree',
    'sf://content/resources-tree',
    {
      title: 'Resources category tree',
      description: 'Top-level resource categories with nested subcategories and published-resource counts.',
      mimeType: 'application/json',
    },
    async (uri, extra) => {
      const mode = effectiveMode(getScopes(extra as ExtraContext), 'content');
      if (!mode) return jsonContents(uri.href, { error: 'forbidden', requires: 'content:read or public:content' });
      const publishedFilter = { status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } };
      const tree = await prisma.resourceCategory.findMany({
        where: { ...(mode === 'public' ? { isActive: true } : {}), parentId: null },
        orderBy: { position: 'asc' },
        select: {
          id: true, name: true, slug: true, description: true, image: true,
          _count: { select: { resources: mode === 'public' ? ({ where: publishedFilter } as any) : true } },
          children: {
            where: mode === 'public' ? { isActive: true } : undefined,
            orderBy: { position: 'asc' },
            select: {
              id: true, name: true, slug: true, description: true, image: true,
              _count: { select: { resources: mode === 'public' ? ({ where: publishedFilter } as any) : true } },
            },
          },
        },
      });
      return jsonContents(uri.href, { mode, categories: tree });
    }
  );

  // ─────────── sf://docs/api-overview ───────────
  server.registerResource(
    'docs-api-overview',
    'sf://docs/api-overview',
    {
      title: 'API overview',
      description: 'Plain-language explanation of available scopes, tools, and URL conventions. Read me first.',
      mimeType: 'text/markdown',
    },
    async (uri) => textContents(uri.href, API_OVERVIEW_MD)
  );
}
