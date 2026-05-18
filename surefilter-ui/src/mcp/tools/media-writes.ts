import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import {
  generatePresignedUploadUrl,
  deleteFromS3,
  createS3Folder,
  deleteS3Folder,
  moveS3Objects,
} from '@/lib/s3';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';
import {
  mutationCommonFields,
  requireWriteScope,
  requireConfirm,
  auditMutation,
} from '@/mcp/tools/_write-helpers';

/** Reject S3 keys with path-traversal segments or leading slashes. */
function safeKey(key: string): { ok: true; key: string } | { ok: false; reason: string } {
  if (!key) return { ok: false, reason: 'key required' };
  if (key.startsWith('/')) return { ok: false, reason: 'key must not start with /' };
  if (key.includes('..')) return { ok: false, reason: 'key must not contain ".."' };
  if (key.includes('\\') || key.includes('\0')) return { ok: false, reason: 'invalid characters in key' };
  return { ok: true, key };
}

const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_URL ?? 'https://assets.surefilter.us').replace(/\/+$/, '');
function buildCdnUrl(s3Path: string): string {
  return `${CDN_BASE}/${s3Path.replace(/^\/+/, '')}`;
}

export function registerMediaWriteTools(server: McpServer) {
  // ─────────── Two-step upload: presign → client PUT → attach metadata ───────────
  server.registerTool(
    'media-presign-upload',
    {
      description:
        'Step 1 of upload: request a presigned S3 PUT URL. Client then PUTs the file directly to that URL, then calls media-attach-metadata to register the MediaAsset row.',
      inputSchema: {
        s3Path: z.string().min(1).describe('Target S3 key, e.g. "images/news/2026/featured.jpg"'),
        contentType: z.string().min(1).describe('MIME type for Content-Type header on the PUT'),
        expiresIn: z.number().int().min(60).max(3600).default(900),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:write', 'media-presign-upload', args);
      if (deny) return deny;
      const sk = safeKey(args.s3Path);
      if (!sk.ok) return errorResult(sk.reason);
      try {
        const url = await generatePresignedUploadUrl(sk.key, args.contentType, args.expiresIn);
        await auditMutation({
          ctx, tool: 'media-presign-upload', action: 'CREATE',
          entityType: 'MediaAsset', entityId: sk.key, entityName: sk.key,
          details: { contentType: args.contentType, expiresIn: args.expiresIn },
        });
        return jsonResult({
          uploadUrl: url,
          s3Path: sk.key,
          expiresIn: args.expiresIn,
          next: 'PUT the file body to uploadUrl with the same Content-Type, then call media-attach-metadata.',
        });
      } catch (e: any) {
        return errorResult(`Failed to issue presigned URL: ${e?.message ?? String(e)}`);
      }
    }
  );

  server.registerTool(
    'media-attach-metadata',
    {
      description:
        'Step 2 of upload: after the client PUTs to the presigned URL, register a MediaAsset row pointing at the S3 key. Overwrites metadata if the row already exists.',
      inputSchema: {
        s3Path: z.string().min(1),
        filename: z.string().min(1),
        mimeType: z.string().min(1),
        fileSize: z.number().int().min(0),
        width: z.number().int().nullable().optional(),
        height: z.number().int().nullable().optional(),
        altText: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        folder: z.string().nullable().optional(),
        isPublic: z.boolean().optional(),
        cdnUrl: z.string().url().optional().describe('Override CDN URL; defaults to NEXT_PUBLIC_CDN_URL + s3Path'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:write', 'media-attach-metadata', args);
      if (deny) return deny;
      const sk = safeKey(args.s3Path);
      if (!sk.ok) return errorResult(sk.reason);
      const { confirm: _c, idempotencyKey: _i, cdnUrl: explicitCdn, ...rest } = args;
      const cdnUrl = explicitCdn ?? buildCdnUrl(sk.key);
      const asset = await prisma.mediaAsset.upsert({
        where: { s3Path: sk.key },
        create: { ...rest, s3Path: sk.key, cdnUrl, uploadedBy: ctx.userId ?? null, isPublic: rest.isPublic ?? true, tags: rest.tags ?? [] },
        update: {
          filename: rest.filename, mimeType: rest.mimeType, fileSize: rest.fileSize,
          width: rest.width ?? null, height: rest.height ?? null,
          altText: rest.altText ?? null, tags: rest.tags ?? [],
          folder: rest.folder ?? null, isPublic: rest.isPublic ?? true,
          cdnUrl,
        },
      });
      await auditMutation({ ctx, tool: 'media-attach-metadata', action: 'UPDATE', entityType: 'MediaAsset', entityId: asset.id, entityName: asset.s3Path });
      return jsonResult({ asset });
    }
  );

  server.registerTool(
    'media-update-asset-metadata',
    {
      description: 'Patch MediaAsset metadata (altText / tags / folder / isPublic) without re-uploading the file.',
      inputSchema: {
        id: z.string().min(1),
        filename: z.string().optional(),
        altText: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        folder: z.string().nullable().optional(),
        isPublic: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:write', 'media-update-asset-metadata', args);
      if (deny) return deny;
      const existing = await prisma.mediaAsset.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('MediaAsset not found');
      const { id, confirm: _c, idempotencyKey: _i, ...patch } = args;
      const updated = await prisma.mediaAsset.update({ where: { id }, data: patch });
      await auditMutation({ ctx, tool: 'media-update-asset-metadata', action: 'UPDATE', entityType: 'MediaAsset', entityId: id, entityName: updated.s3Path, details: { changes: Object.keys(patch) } });
      return jsonResult({ asset: updated });
    }
  );

  server.registerTool(
    'media-delete-file',
    {
      description:
        'Delete a file from S3 + remove its MediaAsset row. Caller must ensure no product/page references it — destructive. Requires media:delete + confirm:true.',
      inputSchema: {
        s3Path: z.string().min(1),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:delete', 'media-delete-file', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `S3:${args.s3Path}`);
      if (needConfirm) return needConfirm;
      const sk = safeKey(args.s3Path);
      if (!sk.ok) return errorResult(sk.reason);
      try {
        await deleteFromS3(sk.key);
      } catch (e: any) {
        return errorResult(`S3 delete failed: ${e?.message ?? String(e)}`);
      }
      const existing = await prisma.mediaAsset.findUnique({ where: { s3Path: sk.key } });
      if (existing) await prisma.mediaAsset.delete({ where: { id: existing.id } });
      await auditMutation({ ctx, tool: 'media-delete-file', action: 'DELETE', entityType: 'MediaAsset', entityId: existing?.id ?? sk.key, entityName: sk.key });
      return jsonResult({ deleted: sk.key, hadDbRow: !!existing });
    }
  );

  // ─────────── Folder operations ───────────
  server.registerTool(
    'media-create-folder',
    {
      description: 'Create an empty S3 "folder" (places a .keep marker). Requires media:write.',
      inputSchema: {
        folderPath: z.string().min(1),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:write', 'media-create-folder', args);
      if (deny) return deny;
      const sk = safeKey(args.folderPath);
      if (!sk.ok) return errorResult(sk.reason);
      try {
        await createS3Folder(sk.key);
      } catch (e: any) {
        return errorResult(`Folder create failed: ${e?.message ?? String(e)}`);
      }
      await auditMutation({ ctx, tool: 'media-create-folder', action: 'CREATE', entityType: 'S3Folder', entityId: sk.key, entityName: sk.key });
      return jsonResult({ folder: sk.key });
    }
  );

  server.registerTool(
    'media-delete-folder',
    {
      description: 'Delete an S3 folder and all objects within. DESTRUCTIVE. Requires media:delete + confirm:true.',
      inputSchema: {
        folderPath: z.string().min(1),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:delete', 'media-delete-folder', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete folder (and all contents)', `S3:${args.folderPath}`);
      if (needConfirm) return needConfirm;
      const sk = safeKey(args.folderPath);
      if (!sk.ok) return errorResult(sk.reason);
      try {
        await deleteS3Folder(sk.key);
        // Best-effort: prune any MediaAsset rows under this folder
        const prefix = sk.key.endsWith('/') ? sk.key : `${sk.key}/`;
        await prisma.mediaAsset.deleteMany({ where: { s3Path: { startsWith: prefix } } });
      } catch (e: any) {
        return errorResult(`Folder delete failed: ${e?.message ?? String(e)}`);
      }
      await auditMutation({ ctx, tool: 'media-delete-folder', action: 'DELETE', entityType: 'S3Folder', entityId: sk.key, entityName: sk.key });
      return jsonResult({ deleted: sk.key });
    }
  );

  server.registerTool(
    'media-rename-folder',
    {
      description:
        'Rename / move an S3 folder (copies all objects under newPath then deletes originals). Best-effort updates MediaAsset.s3Path rows under the prefix. Requires media:write.',
      inputSchema: {
        oldPath: z.string().min(1),
        newPath: z.string().min(1),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'media:write', 'media-rename-folder', args);
      if (deny) return deny;
      const skOld = safeKey(args.oldPath);
      const skNew = safeKey(args.newPath);
      if (!skOld.ok) return errorResult(`oldPath: ${skOld.reason}`);
      if (!skNew.ok) return errorResult(`newPath: ${skNew.reason}`);
      try {
        await moveS3Objects(skOld.key, skNew.key);
        const oldPrefix = skOld.key.endsWith('/') ? skOld.key : `${skOld.key}/`;
        const newPrefix = skNew.key.endsWith('/') ? skNew.key : `${skNew.key}/`;
        const affected = await prisma.mediaAsset.findMany({ where: { s3Path: { startsWith: oldPrefix } }, select: { id: true, s3Path: true } });
        for (const a of affected) {
          const newKey = newPrefix + a.s3Path.slice(oldPrefix.length);
          await prisma.mediaAsset.update({ where: { id: a.id }, data: { s3Path: newKey, cdnUrl: buildCdnUrl(newKey) } });
        }
        await auditMutation({ ctx, tool: 'media-rename-folder', action: 'UPDATE', entityType: 'S3Folder', entityId: skOld.key, entityName: `${skOld.key} → ${skNew.key}`, details: { affectedRows: affected.length } });
        return jsonResult({ from: skOld.key, to: skNew.key, affectedRows: affected.length });
      } catch (e: any) {
        return errorResult(`Folder rename failed: ${e?.message ?? String(e)}`);
      }
    }
  );
}
