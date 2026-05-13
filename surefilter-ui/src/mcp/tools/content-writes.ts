import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';
import {
  mutationCommonFields,
  requireWriteScope,
  requireConfirm,
  auditMutation,
  safeInvalidate,
  resourcePublicPath,
  validateResourceCategoryParent,
} from '@/mcp/tools/_write-helpers';

const ArticleStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const ResourceStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const ArticleType = z.enum(['NEWS', 'EVENT']);

export function registerContentWriteTools(server: McpServer) {
  // ───────────────────────── NewsCategory ─────────────────────────
  server.registerTool(
    'content-create-news-category',
    {
      description: 'Create a news category. Requires content:write.',
      inputSchema: {
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters/numbers/hyphens'),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        position: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-create-news-category', args);
      if (deny) return deny;
      const conflict = await prisma.newsCategory.findFirst({ where: { OR: [{ slug: args.slug }, { name: args.name }] } });
      if (conflict) return errorResult(`A news category with this ${conflict.slug === args.slug ? 'slug' : 'name'} already exists`);
      const created = await prisma.newsCategory.create({
        data: {
          name: args.name, slug: args.slug, description: args.description,
          color: args.color, icon: args.icon,
          position: args.position ?? 0, isActive: args.isActive ?? true,
        },
      });
      await auditMutation({ ctx, tool: 'content-create-news-category', action: 'CREATE', entityType: 'NewsCategory', entityId: created.id, entityName: created.name, details: { slug: created.slug } });
      await safeInvalidate(['/newsroom']);
      return jsonResult({ category: created });
    }
  );

  server.registerTool(
    'content-update-news-category',
    {
      description: 'Update a news category. Requires content:write.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().min(1).optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        position: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-update-news-category', args);
      if (deny) return deny;
      const existing = await prisma.newsCategory.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('News category not found');
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.newsCategory.update({ where: { id }, data: patch });
      await auditMutation({ ctx, tool: 'content-update-news-category', action: 'UPDATE', entityType: 'NewsCategory', entityId: id, entityName: updated.name, details: { changes: Object.keys(patch) } });
      await safeInvalidate(['/newsroom']);
      return jsonResult({ category: updated });
    }
  );

  server.registerTool(
    'content-delete-news-category',
    {
      description: 'Delete a news category. Fails if any articles reference it. Requires content:write + confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-delete-news-category', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `NewsCategory:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.newsCategory.findUnique({ where: { id: args.id }, include: { _count: { select: { articles: true } } } });
      if (!existing) return errorResult('News category not found');
      if (existing._count.articles > 0) return errorResult(`Category is used by ${existing._count.articles} article(s) — reassign first`);
      await prisma.newsCategory.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'content-delete-news-category', action: 'DELETE', entityType: 'NewsCategory', entityId: args.id, entityName: existing.name });
      await safeInvalidate(['/newsroom']);
      return jsonResult({ deleted: existing.id });
    }
  );

  // ───────────────────────── NewsArticle ─────────────────────────
  server.registerTool(
    'content-create-news',
    {
      description: 'Create a news article or event (default status=DRAFT). Requires content:write.',
      inputSchema: {
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        type: ArticleType.optional(),
        title: z.string().min(1),
        excerpt: z.string().min(1),
        content: z.string().min(1).describe('Sanitized HTML (server-side sanitization is currently only applied at render — keep this clean).'),
        featuredImage: z.string().optional(),
        featuredImageAlt: z.string().optional(),
        categoryId: z.string().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().optional(),
        publishedAt: z.string().datetime().optional().describe('Defaults to now() if omitted.'),
        // Event fields
        eventStartDate: z.string().datetime().optional(),
        eventEndDate: z.string().datetime().optional(),
        eventUrl: z.string().url().optional(),
        venue: z.string().optional(),
        location: z.string().optional(),
        booth: z.string().optional(),
        isFeatured: z.boolean().optional(),
        // SEO
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-create-news', args);
      if (deny) return deny;
      const existing = await prisma.newsArticle.findUnique({ where: { slug: args.slug } });
      if (existing) return errorResult('An article with this slug already exists');
      const { confirm: _c, idempotencyKey: _i, publishedAt, eventStartDate, eventEndDate, type, tags, ...rest } = args;
      const created = await prisma.newsArticle.create({
        data: {
          ...rest,
          type: type ?? 'NEWS',
          tags: tags ?? [],
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
          eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
          status: 'DRAFT',
        },
      });
      await auditMutation({ ctx, tool: 'content-create-news', action: 'CREATE', entityType: 'NewsArticle', entityId: created.id, entityName: created.slug, details: { type: created.type } });
      return jsonResult({ article: created });
    }
  );

  server.registerTool(
    'content-update-news',
    {
      description: 'Update a news article / event. Pass only fields you want changed. Requires content:write.',
      inputSchema: {
        id: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        type: ArticleType.optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        featuredImage: z.string().optional(),
        featuredImageAlt: z.string().optional(),
        categoryId: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().optional(),
        publishedAt: z.string().datetime().optional(),
        eventStartDate: z.string().datetime().nullable().optional(),
        eventEndDate: z.string().datetime().nullable().optional(),
        eventUrl: z.string().url().nullable().optional(),
        venue: z.string().optional(),
        location: z.string().optional(),
        booth: z.string().optional(),
        isFeatured: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-update-news', args);
      if (deny) return deny;
      const existing = await prisma.newsArticle.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Article not found');
      const { id, confirm: _c, idempotencyKey: _i, publishedAt, eventStartDate, eventEndDate, ...patch } = args;
      const data: any = { ...patch };
      if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt);
      if (eventStartDate !== undefined) data.eventStartDate = eventStartDate ? new Date(eventStartDate) : null;
      if (eventEndDate !== undefined) data.eventEndDate = eventEndDate ? new Date(eventEndDate) : null;
      const updated = await prisma.newsArticle.update({ where: { id }, data });
      const paths = new Set<string>(['/newsroom', `/newsroom/${updated.slug}`]);
      if (existing.slug !== updated.slug) paths.add(`/newsroom/${existing.slug}`);
      await auditMutation({ ctx, tool: 'content-update-news', action: 'UPDATE', entityType: 'NewsArticle', entityId: id, entityName: updated.slug, details: { changes: Object.keys(patch) } });
      await safeInvalidate(Array.from(paths));
      return jsonResult({ article: updated });
    }
  );

  server.registerTool(
    'content-publish-news',
    {
      description:
        'Transition a news article between DRAFT / PUBLISHED / ARCHIVED. Setting PUBLISHED without explicit publishedAt fills it with now(). Requires content:publish + confirm:true.',
      inputSchema: {
        id: z.string().min(1),
        status: ArticleStatus,
        publishedAt: z.string().datetime().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:publish', 'content-publish-news', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, `transition to ${args.status}`, `NewsArticle:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.newsArticle.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Article not found');
      const data: any = { status: args.status };
      if (args.publishedAt) data.publishedAt = new Date(args.publishedAt);
      else if (args.status === 'PUBLISHED' && !existing.publishedAt) data.publishedAt = new Date();
      const updated = await prisma.newsArticle.update({ where: { id: args.id }, data });
      await auditMutation({ ctx, tool: 'content-publish-news', action: 'UPDATE', entityType: 'NewsArticle', entityId: updated.id, entityName: updated.slug, details: { from: existing.status, to: updated.status, publishedAt: updated.publishedAt } });
      await safeInvalidate(['/newsroom', `/newsroom/${updated.slug}`]);
      return jsonResult({ article: updated });
    }
  );

  server.registerTool(
    'content-delete-news',
    {
      description: 'Delete a news article. Requires content:write + confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-delete-news', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `NewsArticle:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.newsArticle.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Article not found');
      await prisma.newsArticle.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'content-delete-news', action: 'DELETE', entityType: 'NewsArticle', entityId: existing.id, entityName: existing.slug });
      await safeInvalidate(['/newsroom', `/newsroom/${existing.slug}`]);
      return jsonResult({ deleted: existing.id });
    }
  );

  // ───────────────────────── ResourceCategory ─────────────────────────
  server.registerTool(
    'content-create-resource-category',
    {
      description:
        'Create a resource category. If `parentId` is set, that parent must be a top-level category (max hierarchy depth = 2). Requires content:write.',
      inputSchema: {
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        image: z.string().optional().describe('S3 key for subcategory image card'),
        parentId: z.string().nullable().optional(),
        position: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-create-resource-category', args);
      if (deny) return deny;
      const existing = await prisma.resourceCategory.findFirst({ where: { OR: [{ slug: args.slug }, { name: args.name }] } });
      if (existing) return errorResult(`A category with this ${existing.slug === args.slug ? 'slug' : 'name'} already exists`);
      const hierarchyErr = await validateResourceCategoryParent(args.parentId);
      if (hierarchyErr) return errorResult(hierarchyErr);
      const { confirm: _c, idempotencyKey: _i, ...data } = args;
      const created = await prisma.resourceCategory.create({
        data: { ...data, position: data.position ?? 0, isActive: data.isActive ?? true },
      });
      await auditMutation({ ctx, tool: 'content-create-resource-category', action: 'CREATE', entityType: 'ResourceCategory', entityId: created.id, entityName: created.name, details: { slug: created.slug, parentId: created.parentId } });
      await safeInvalidate(['/resources', '/resources/*']);
      return jsonResult({ category: created });
    }
  );

  server.registerTool(
    'content-update-resource-category',
    {
      description:
        'Update a resource category. parentId changes are validated (max depth = 2, no self-parent, no children-while-becoming-subcategory). Requires content:write.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        image: z.string().optional(),
        parentId: z.string().nullable().optional(),
        position: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-update-resource-category', args);
      if (deny) return deny;
      const existing = await prisma.resourceCategory.findUnique({ where: { id: args.id }, include: { children: { select: { id: true } } } });
      if (!existing) return errorResult('Category not found');
      if (args.parentId !== undefined && args.parentId !== null) {
        const hierarchyErr = await validateResourceCategoryParent(args.parentId, args.id, existing.children.length > 0);
        if (hierarchyErr) return errorResult(hierarchyErr);
      }
      if (args.slug && args.slug !== existing.slug) {
        const slugConflict = await prisma.resourceCategory.findFirst({ where: { slug: args.slug, id: { not: args.id } } });
        if (slugConflict) return errorResult('Slug already in use');
      }
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.resourceCategory.update({ where: { id }, data: patch });
      await auditMutation({ ctx, tool: 'content-update-resource-category', action: 'UPDATE', entityType: 'ResourceCategory', entityId: id, entityName: updated.name, details: { changes: Object.keys(patch) } });
      await safeInvalidate(['/resources', '/resources/*']);
      return jsonResult({ category: updated });
    }
  );

  server.registerTool(
    'content-delete-resource-category',
    {
      description: 'Delete a resource category. Fails if any resources or subcategories reference it. Requires content:write + confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-delete-resource-category', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `ResourceCategory:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.resourceCategory.findUnique({ where: { id: args.id }, include: { _count: { select: { resources: true, children: true } } } });
      if (!existing) return errorResult('Category not found');
      if (existing._count.resources > 0) return errorResult(`Category has ${existing._count.resources} resource(s) — reassign first`);
      if (existing._count.children > 0) return errorResult(`Category has ${existing._count.children} subcategor(y/ies) — delete or reassign first`);
      await prisma.resourceCategory.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'content-delete-resource-category', action: 'DELETE', entityType: 'ResourceCategory', entityId: existing.id, entityName: existing.name });
      await safeInvalidate(['/resources', '/resources/*']);
      return jsonResult({ deleted: existing.id });
    }
  );

  // ───────────────────────── Resource ─────────────────────────
  server.registerTool(
    'content-create-resource',
    {
      description:
        'Create a resource (catalog/document). Status defaults to DRAFT — use content-publish-resource to make it public. Requires content:write.',
      inputSchema: {
        title: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().min(1),
        shortDescription: z.string().optional(),
        thumbnailImage: z.string().optional(),
        file: z.string().min(1).describe('S3 key for the main asset (PDF/Video/Document)'),
        fileType: z.string().min(1).describe('"PDF" | "Video" | "Document"'),
        fileSize: z.string().optional(),
        fileMeta: z.string().optional(),
        allowDirectDownload: z.boolean().optional(),
        allowPreview: z.boolean().optional(),
        categoryId: z.string().min(1),
        formId: z.string().nullable().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-create-resource', args);
      if (deny) return deny;
      const dup = await prisma.resource.findUnique({ where: { slug: args.slug } });
      if (dup) return errorResult('A resource with this slug already exists');
      const cat = await prisma.resourceCategory.findUnique({ where: { id: args.categoryId }, select: { id: true, slug: true, parent: { select: { slug: true } } } });
      if (!cat) return errorResult('Category not found');
      const { confirm: _c, idempotencyKey: _i, ...data } = args;
      const created = await prisma.resource.create({ data: { ...data, status: 'DRAFT' } });
      await auditMutation({ ctx, tool: 'content-create-resource', action: 'CREATE', entityType: 'Resource', entityId: created.id, entityName: created.slug });
      const publicUrl = resourcePublicPath(created.slug, cat);
      const paths = new Set<string>(['/resources']);
      if (cat.parent?.slug) paths.add(`/resources/${cat.parent.slug}`);
      paths.add(`/resources/${cat.parent?.slug ?? cat.slug}${cat.parent ? '/' + cat.slug : ''}`);
      await safeInvalidate(Array.from(paths));
      return jsonResult({ resource: created, publicUrl });
    }
  );

  server.registerTool(
    'content-update-resource',
    {
      description: 'Update a resource. Pass only fields you want changed. Requires content:write.',
      inputSchema: {
        id: z.string().min(1),
        title: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        thumbnailImage: z.string().optional(),
        file: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.string().optional(),
        fileMeta: z.string().optional(),
        allowDirectDownload: z.boolean().optional(),
        allowPreview: z.boolean().optional(),
        categoryId: z.string().optional(),
        formId: z.string().nullable().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-update-resource', args);
      if (deny) return deny;
      const existing = await prisma.resource.findUnique({ where: { id: args.id }, include: { category: { include: { parent: { select: { slug: true } } } } } });
      if (!existing) return errorResult('Resource not found');
      if (args.categoryId && args.categoryId !== existing.categoryId) {
        const cat = await prisma.resourceCategory.findUnique({ where: { id: args.categoryId } });
        if (!cat) return errorResult('New category not found');
      }
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.resource.update({
        where: { id }, data: patch,
        include: { category: { include: { parent: { select: { slug: true } } } } },
      });
      const paths = new Set<string>(['/resources']);
      const newPath = resourcePublicPath(updated.slug, updated.category);
      if (newPath) paths.add(newPath);
      const oldPath = resourcePublicPath(existing.slug, existing.category);
      if (oldPath && oldPath !== newPath) paths.add(oldPath);
      await auditMutation({ ctx, tool: 'content-update-resource', action: 'UPDATE', entityType: 'Resource', entityId: id, entityName: updated.slug, details: { changes: Object.keys(patch) } });
      await safeInvalidate(Array.from(paths));
      return jsonResult({ resource: updated, publicUrl: newPath });
    }
  );

  server.registerTool(
    'content-publish-resource',
    {
      description: 'Transition a resource between DRAFT / PUBLISHED / ARCHIVED. Requires content:publish + confirm:true.',
      inputSchema: {
        id: z.string().min(1),
        status: ResourceStatus,
        publishedAt: z.string().datetime().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:publish', 'content-publish-resource', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, `transition to ${args.status}`, `Resource:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.resource.findUnique({ where: { id: args.id }, include: { category: { include: { parent: { select: { slug: true } } } } } });
      if (!existing) return errorResult('Resource not found');
      const data: any = { status: args.status };
      if (args.publishedAt) data.publishedAt = new Date(args.publishedAt);
      else if (args.status === 'PUBLISHED' && !existing.publishedAt) data.publishedAt = new Date();
      const updated = await prisma.resource.update({
        where: { id: args.id }, data,
        include: { category: { include: { parent: { select: { slug: true } } } } },
      });
      await auditMutation({ ctx, tool: 'content-publish-resource', action: 'UPDATE', entityType: 'Resource', entityId: updated.id, entityName: updated.slug, details: { from: existing.status, to: updated.status } });
      const url = resourcePublicPath(updated.slug, updated.category);
      await safeInvalidate(['/resources', ...(url ? [url] : [])]);
      return jsonResult({ resource: updated, publicUrl: url });
    }
  );

  server.registerTool(
    'content-delete-resource',
    {
      description: 'Delete a resource. Requires content:write + confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'content:write', 'content-delete-resource', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `Resource:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.resource.findUnique({ where: { id: args.id }, include: { category: { include: { parent: { select: { slug: true } } } } } });
      if (!existing) return errorResult('Resource not found');
      await prisma.resource.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'content-delete-resource', action: 'DELETE', entityType: 'Resource', entityId: existing.id, entityName: existing.slug });
      const url = resourcePublicPath(existing.slug, existing.category);
      await safeInvalidate(['/resources', ...(url ? [url] : [])]);
      return jsonResult({ deleted: existing.id });
    }
  );
}
