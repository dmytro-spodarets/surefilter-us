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

export function registerCatalogWriteTools(server: McpServer) {
  // ───────────────────────── Brand ─────────────────────────
  server.registerTool(
    'catalog-create-brand',
    {
      description: 'Create a product brand. Requires catalog:write.',
      inputSchema: {
        name: z.string().min(1),
        code: z.string().optional(),
        description: z.string().optional(),
        logoUrl: z.string().optional().describe('S3 path or full URL'),
        website: z.string().url().optional(),
        isActive: z.boolean().optional(),
        position: z.number().int().min(0).optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'catalog:write', 'catalog-create-brand', args);
      if (deny) return deny;
      const conflict = await prisma.brand.findFirst({
        where: { OR: [{ name: args.name }, ...(args.code ? [{ code: args.code }] : [])] },
      });
      if (conflict) return errorResult('A brand with this name or code already exists');
      const { confirm: _c, idempotencyKey: _i, ...data } = args;
      const created = await prisma.brand.create({
        data: { ...data, isActive: data.isActive ?? true, position: data.position ?? 0 },
      });
      await auditMutation({ ctx, tool: 'catalog-create-brand', action: 'CREATE', entityType: 'Brand', entityId: created.id, entityName: created.name });
      await safeInvalidate(['/']);
      return jsonResult({ brand: created });
    }
  );

  server.registerTool(
    'catalog-update-brand',
    {
      description: 'Update a brand. Requires catalog:write.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().optional(),
        code: z.string().nullable().optional(),
        description: z.string().optional(),
        logoUrl: z.string().optional(),
        website: z.string().url().nullable().optional(),
        isActive: z.boolean().optional(),
        position: z.number().int().min(0).optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'catalog:write', 'catalog-update-brand', args);
      if (deny) return deny;
      const existing = await prisma.brand.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Brand not found');
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.brand.update({ where: { id }, data: patch });
      await auditMutation({ ctx, tool: 'catalog-update-brand', action: 'UPDATE', entityType: 'Brand', entityId: id, entityName: updated.name, details: { changes: Object.keys(patch) } });
      await safeInvalidate(['/']);
      return jsonResult({ brand: updated });
    }
  );

  server.registerTool(
    'catalog-delete-brand',
    {
      description: 'Delete a brand. Fails if any products reference it. Requires catalog:write + confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'catalog:write', 'catalog-delete-brand', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `Brand:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.brand.findUnique({ where: { id: args.id }, include: { _count: { select: { products: true } } } });
      if (!existing) return errorResult('Brand not found');
      if (existing._count.products > 0) return errorResult(`Brand has ${existing._count.products} product(s) — reassign first`);
      await prisma.brand.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'catalog-delete-brand', action: 'DELETE', entityType: 'Brand', entityId: existing.id, entityName: existing.name });
      await safeInvalidate(['/']);
      return jsonResult({ deleted: existing.id });
    }
  );

  // ───────────────────────── Product ─────────────────────────
  const CategoryAssignment = z.object({
    categoryId: z.string().min(1),
    isPrimary: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  });
  const SpecValue = z.object({
    parameterId: z.string().min(1),
    value: z.string().min(1),
    unitOverride: z.string().nullable().optional(),
    position: z.number().int().min(0).optional(),
  });
  const MediaItem = z.object({
    assetId: z.string().min(1),
    isPrimary: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
    caption: z.string().nullable().optional(),
  });
  const CrossRef = z.object({
    refBrandName: z.string().min(1),
    refCode: z.string().min(1),
    referenceType: z.string().optional(),
    isPreferred: z.boolean().optional(),
    notes: z.string().nullable().optional(),
  });

  server.registerTool(
    'catalog-create-product',
    {
      description: 'Create a product with optional category assignments, spec values, media, and cross-references. Requires catalog:write.',
      inputSchema: {
        code: z.string().min(1),
        name: z.string().optional(),
        description: z.string().optional(),
        manufacturerCatalogUrl: z.string().url().optional(),
        brandId: z.string().min(1),
        filterTypeId: z.string().nullable().optional(),
        status: z.string().optional(),
        tags: z.array(z.string()).optional(),
        manufacturer: z.string().optional(),
        industries: z.array(z.string()).optional(),
        categoryAssignments: z.array(CategoryAssignment).optional(),
        specValues: z.array(SpecValue).optional(),
        mediaItems: z.array(MediaItem).optional(),
        crossReferences: z.array(CrossRef).optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'catalog:write', 'catalog-create-product', args);
      if (deny) return deny;
      const dup = await prisma.product.findUnique({ where: { code: args.code } });
      if (dup) return errorResult('A product with this code already exists');
      const product = await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            code: args.code,
            name: args.name ?? null,
            description: args.description ?? null,
            manufacturerCatalogUrl: args.manufacturerCatalogUrl ?? null,
            brandId: args.brandId,
            filterTypeId: args.filterTypeId ?? null,
            status: args.status ?? null,
            tags: args.tags ?? [],
            manufacturer: args.manufacturer ?? null,
            industries: args.industries ?? [],
          },
        });
        if (args.categoryAssignments?.length) {
          await tx.productCategoryAssignment.createMany({
            data: args.categoryAssignments.map((ca) => ({ productId: created.id, categoryId: ca.categoryId, isPrimary: ca.isPrimary ?? false, position: ca.position ?? 0 })),
          });
        }
        if (args.specValues?.length) {
          await tx.productSpecValue.createMany({
            data: args.specValues.map((sv) => ({ productId: created.id, parameterId: sv.parameterId, value: sv.value, unitOverride: sv.unitOverride ?? null, position: sv.position ?? 0 })),
          });
        }
        if (args.mediaItems?.length) {
          await tx.productMedia.createMany({
            data: args.mediaItems.map((mi) => ({ productId: created.id, assetId: mi.assetId, isPrimary: mi.isPrimary ?? false, position: mi.position ?? 0, caption: mi.caption ?? null })),
          });
        }
        if (args.crossReferences?.length) {
          await tx.productCrossReference.createMany({
            data: args.crossReferences.map((cr) => ({ productId: created.id, refBrandName: cr.refBrandName, refCode: cr.refCode, referenceType: cr.referenceType ?? 'OEM', isPreferred: cr.isPreferred ?? false, notes: cr.notes ?? null })),
          });
        }
        return tx.product.findUnique({ where: { id: created.id }, include: { brand: true, filterType: true, categories: { include: { category: true } }, specValues: { include: { parameter: true } }, media: { include: { asset: true } }, crossReferences: true } });
      });
      await auditMutation({ ctx, tool: 'catalog-create-product', action: 'CREATE', entityType: 'Product', entityId: product!.id, entityName: product!.code });
      await safeInvalidate(['/', `/products/${product!.code}`]);
      return jsonResult({ product });
    }
  );

  server.registerTool(
    'catalog-update-product',
    {
      description:
        'Update a product. When `categoryAssignments` / `specValues` / `mediaItems` / `crossReferences` are passed, those collections are REPLACED in full (mirrors the admin web UI semantics). Requires catalog:write.',
      inputSchema: {
        id: z.string().min(1),
        code: z.string().optional(),
        name: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        manufacturerCatalogUrl: z.string().url().nullable().optional(),
        brandId: z.string().optional(),
        filterTypeId: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        manufacturer: z.string().nullable().optional(),
        industries: z.array(z.string()).optional(),
        categoryAssignments: z.array(CategoryAssignment).optional(),
        specValues: z.array(SpecValue).optional(),
        mediaItems: z.array(MediaItem).optional(),
        crossReferences: z.array(CrossRef).optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'catalog:write', 'catalog-update-product', args);
      if (deny) return deny;
      const existing = await prisma.product.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Product not found');
      if (args.code && args.code !== existing.code) {
        const conflict = await prisma.product.findFirst({ where: { code: args.code, id: { not: args.id } } });
        if (conflict) return errorResult('Another product with this code already exists');
      }

      const updated = await prisma.$transaction(async (tx) => {
        const { id, confirm: _c, idempotencyKey: _i, categoryAssignments, specValues, mediaItems, crossReferences, ...patch } = args;
        await tx.product.update({ where: { id }, data: patch });
        if (categoryAssignments) {
          await tx.productCategoryAssignment.deleteMany({ where: { productId: id } });
          if (categoryAssignments.length) await tx.productCategoryAssignment.createMany({ data: categoryAssignments.map((ca) => ({ productId: id, categoryId: ca.categoryId, isPrimary: ca.isPrimary ?? false, position: ca.position ?? 0 })) });
        }
        if (specValues) {
          await tx.productSpecValue.deleteMany({ where: { productId: id } });
          if (specValues.length) await tx.productSpecValue.createMany({ data: specValues.map((sv) => ({ productId: id, parameterId: sv.parameterId, value: sv.value, unitOverride: sv.unitOverride ?? null, position: sv.position ?? 0 })) });
        }
        if (mediaItems) {
          await tx.productMedia.deleteMany({ where: { productId: id } });
          if (mediaItems.length) await tx.productMedia.createMany({ data: mediaItems.map((mi) => ({ productId: id, assetId: mi.assetId, isPrimary: mi.isPrimary ?? false, position: mi.position ?? 0, caption: mi.caption ?? null })) });
        }
        if (crossReferences) {
          await tx.productCrossReference.deleteMany({ where: { productId: id } });
          if (crossReferences.length) await tx.productCrossReference.createMany({ data: crossReferences.map((cr) => ({ productId: id, refBrandName: cr.refBrandName, refCode: cr.refCode, referenceType: cr.referenceType ?? 'OEM', isPreferred: cr.isPreferred ?? false, notes: cr.notes ?? null })) });
        }
        return tx.product.findUnique({ where: { id }, include: { brand: true, filterType: true, categories: { include: { category: true } }, specValues: { include: { parameter: true } }, media: { include: { asset: true } }, crossReferences: true } });
      });

      const paths = ['/', `/products/${updated!.code}`];
      if (existing.code !== updated!.code) paths.push(`/products/${existing.code}`);
      await auditMutation({ ctx, tool: 'catalog-update-product', action: 'UPDATE', entityType: 'Product', entityId: args.id, entityName: updated!.code });
      await safeInvalidate(paths);
      return jsonResult({ product: updated });
    }
  );

  server.registerTool(
    'catalog-delete-product',
    {
      description: 'Delete a product (cascade deletes related categories/specs/media/cross-refs). Requires catalog:write + confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'catalog:write', 'catalog-delete-product', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `Product:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.product.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Product not found');
      await prisma.product.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'catalog-delete-product', action: 'DELETE', entityType: 'Product', entityId: existing.id, entityName: existing.code });
      await safeInvalidate(['/', `/products/${existing.code}`]);
      return jsonResult({ deleted: existing.id });
    }
  );
}
