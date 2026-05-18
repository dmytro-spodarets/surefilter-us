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
} from '@/mcp/tools/_write-helpers';

const PageStatus = z.enum(['draft', 'published']);
const PageType = z.enum(['CORE', 'CUSTOM', 'INDUSTRY']);

function pagePaths(slug: string) {
  // CMS pages map roughly to /{slug}, but home is /. Be generous: hit slug + root.
  const path = slug === 'home' ? '/' : `/${slug}`;
  return ['/', path];
}

export function registerCmsWriteTools(server: McpServer) {
  // ─────────── Page CRUD ───────────
  server.registerTool(
    'cms-create-page',
    {
      description:
        'Create a new CMS page. Default status=draft so it stays hidden until cms-publish-page flips it. Requires cms:write.',
      inputSchema: {
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        ogImage: z.string().nullable().optional(),
        type: PageType.optional(),
        status: PageStatus.optional().describe('Defaults to "draft" — flip via cms-publish-page.'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-create-page', args);
      if (deny) return deny;
      const dup = await prisma.page.findUnique({ where: { slug: args.slug } });
      if (dup) return errorResult('A page with this slug already exists');
      const { confirm: _c, idempotencyKey: _i, ...data } = args;
      const created = await prisma.page.create({
        data: { ...data, status: data.status ?? 'draft', type: data.type ?? 'CUSTOM' },
      });
      await auditMutation({ ctx, tool: 'cms-create-page', action: 'CREATE', entityType: 'Page', entityId: created.id, entityName: created.slug, details: { type: created.type } });
      await safeInvalidate(pagePaths(created.slug));
      return jsonResult({ page: created });
    }
  );

  server.registerTool(
    'cms-update-page',
    {
      description: 'Update a CMS page (title / description / metadata / type). For status transitions use cms-publish-page.',
      inputSchema: {
        id: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        ogImage: z.string().nullable().optional(),
        type: PageType.optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-update-page', args);
      if (deny) return deny;
      const existing = await prisma.page.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Page not found');
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.page.update({ where: { id }, data: patch });
      const paths = new Set<string>([...pagePaths(updated.slug)]);
      if (existing.slug !== updated.slug) pagePaths(existing.slug).forEach((p) => paths.add(p));
      await auditMutation({ ctx, tool: 'cms-update-page', action: 'UPDATE', entityType: 'Page', entityId: id, entityName: updated.slug, details: { changes: Object.keys(patch) } });
      await safeInvalidate(Array.from(paths));
      return jsonResult({ page: updated });
    }
  );

  server.registerTool(
    'cms-publish-page',
    {
      description:
        'Transition a CMS page between draft / published. Affects what anonymous callers see. Requires cms:publish + confirm:true.',
      inputSchema: {
        id: z.string().min(1),
        status: PageStatus,
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:publish', 'cms-publish-page', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, `transition to ${args.status}`, `Page:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.page.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Page not found');
      const updated = await prisma.page.update({ where: { id: args.id }, data: { status: args.status } });
      await auditMutation({ ctx, tool: 'cms-publish-page', action: 'UPDATE', entityType: 'Page', entityId: updated.id, entityName: updated.slug, details: { from: existing.status, to: updated.status } });
      await safeInvalidate(pagePaths(updated.slug));
      return jsonResult({ page: updated });
    }
  );

  server.registerTool(
    'cms-delete-page',
    {
      description: 'Delete a CMS page (cascade-deletes its PageSection rows; the underlying Section/SharedSection rows survive). Requires confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-delete-page', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `Page:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.page.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Page not found');
      await prisma.page.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'cms-delete-page', action: 'DELETE', entityType: 'Page', entityId: existing.id, entityName: existing.slug });
      await safeInvalidate(pagePaths(existing.slug));
      return jsonResult({ deleted: existing.id });
    }
  );

  // ─────────── PageSection reorder ───────────
  server.registerTool(
    'cms-reorder-page-sections',
    {
      description:
        'Reorder PageSection rows for a page. Provide the complete ordered list of pageSection ids — positions are rewritten 0..N-1.',
      inputSchema: {
        pageId: z.string().min(1),
        pageSectionIds: z.array(z.string().min(1)).min(1).describe('PageSection.id values in the desired order'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-reorder-page-sections', args);
      if (deny) return deny;
      const page = await prisma.page.findUnique({ where: { id: args.pageId }, include: { sections: { select: { id: true } } } });
      if (!page) return errorResult('Page not found');
      const known = new Set(page.sections.map((s) => s.id));
      const incoming = new Set(args.pageSectionIds);
      if (known.size !== incoming.size || ![...known].every((k) => incoming.has(k))) {
        return errorResult(`pageSectionIds must match the current set exactly (page has ${known.size} sections, payload has ${incoming.size})`);
      }
      await prisma.$transaction(
        args.pageSectionIds.map((id, position) =>
          prisma.pageSection.update({ where: { id }, data: { position } })
        )
      );
      await auditMutation({ ctx, tool: 'cms-reorder-page-sections', action: 'UPDATE', entityType: 'Page', entityId: page.id, entityName: page.slug, details: { reorderedCount: args.pageSectionIds.length } });
      await safeInvalidate(pagePaths(page.slug));
      return jsonResult({ ok: true, pageId: page.id, count: args.pageSectionIds.length });
    }
  );

  // ─────────── SharedSection CRUD ───────────
  server.registerTool(
    'cms-create-shared-section',
    {
      description:
        'Create a reusable shared section. `type` must be a valid SectionType enum value; `data` is the section payload (validated by the section component, not enforced here).',
      inputSchema: {
        name: z.string().min(1),
        type: z.string().min(1),
        data: z.any(),
        description: z.string().nullable().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-create-shared-section', args);
      if (deny) return deny;
      const { confirm: _c, idempotencyKey: _i, type, ...rest } = args;
      const created = await prisma.sharedSection.create({ data: { ...rest, type: type as any } });
      await auditMutation({ ctx, tool: 'cms-create-shared-section', action: 'CREATE', entityType: 'SharedSection', entityId: created.id, entityName: created.name, details: { type } });
      await safeInvalidate(['/']);
      return jsonResult({ sharedSection: created });
    }
  );

  server.registerTool(
    'cms-update-shared-section',
    {
      description:
        'Update a shared section. Changes propagate to every Page that references it via Section.sharedSectionId.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().optional(),
        type: z.string().optional(),
        data: z.any().optional(),
        description: z.string().nullable().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-update-shared-section', args);
      if (deny) return deny;
      const existing = await prisma.sharedSection.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('SharedSection not found');
      const { id, confirm: _c, idempotencyKey: _i, type, ...patch } = args;
      const data: any = { ...patch };
      if (type) data.type = type as any;
      const updated = await prisma.sharedSection.update({ where: { id }, data });
      await auditMutation({ ctx, tool: 'cms-update-shared-section', action: 'UPDATE', entityType: 'SharedSection', entityId: id, entityName: updated.name, details: { changes: Object.keys(data) } });
      await safeInvalidate(['/']);
      return jsonResult({ sharedSection: updated });
    }
  );

  server.registerTool(
    'cms-delete-shared-section',
    {
      description: 'Delete a shared section. Section.sharedSectionId becomes null (SetNull) — referencing pages stay intact. Requires confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cms:write', 'cms-delete-shared-section', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `SharedSection:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.sharedSection.findUnique({ where: { id: args.id }, include: { _count: { select: { sections: true } } } });
      if (!existing) return errorResult('SharedSection not found');
      await prisma.sharedSection.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'cms-delete-shared-section', action: 'DELETE', entityType: 'SharedSection', entityId: existing.id, entityName: existing.name, details: { detachedSections: existing._count.sections } });
      await safeInvalidate(['/']);
      return jsonResult({ deleted: existing.id, detachedSections: existing._count.sections });
    }
  );
}
