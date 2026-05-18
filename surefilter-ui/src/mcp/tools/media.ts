import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { listS3Objects } from '@/lib/s3';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, requireScope, type ExtraContext } from '@/mcp/tools/_helpers';

export function registerMediaTools(server: McpServer) {
  // ─────────── media-list-files ───────────
  server.registerTool(
    'media-list-files',
    {
      description:
        'List files in an S3 media library folder (media:read). Returns S3 objects + matching MediaAsset metadata (altText/tags/dimensions). Mirrors GET /api/admin/files/list.',
      inputSchema: {
        prefix: z.string().optional().default('').describe('S3 prefix (folder path), e.g. "images/products/"'),
        search: z.string().optional().describe('Filter by filename substring (case-insensitive)'),
        maxKeys: z.number().int().min(1).max(200).default(50),
        continuationToken: z.string().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'media:read', 'media-list-files', args);
      if (deny) return deny;

      const result = await listS3Objects(args.prefix ?? '', args.maxKeys, args.continuationToken);
      const fileKeys = result.files.map((f) => f.key);
      const assets = fileKeys.length
        ? await prisma.mediaAsset.findMany({
            where: { s3Path: { in: fileKeys } },
            select: {
              id: true, filename: true, s3Path: true, cdnUrl: true,
              mimeType: true, fileSize: true, width: true, height: true,
              altText: true, tags: true, folder: true, isPublic: true,
            },
          })
        : [];

      let files = result.files.map((f) => {
        const meta = assets.find((a) => a.s3Path === f.key) ?? null;
        return { ...f, metadata: meta };
      });
      if (args.search) {
        const q = args.search.toLowerCase();
        files = files.filter((f) => (f.metadata?.filename ?? f.key).toLowerCase().includes(q));
      }

      await logToolCall({ tool: 'media-list-files', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${files.length} files, ${result.folders.length} folders` });
      return jsonResult({
        prefix: args.prefix ?? '',
        files,
        folders: result.folders,
        hasMore: result.hasMore,
        nextToken: result.nextToken,
      });
    }
  );

  // ─────────── media-get-asset ───────────
  server.registerTool(
    'media-get-asset',
    {
      description: 'Get a MediaAsset row by id or s3Path (media:read).',
      inputSchema: {
        id: z.string().optional(),
        s3Path: z.string().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'media:read', 'media-get-asset', args);
      if (deny) return deny;
      if (!args.id && !args.s3Path) return errorResult('Either `id` or `s3Path` is required');

      const asset = await prisma.mediaAsset.findFirst({
        where: args.id ? { id: args.id } : { s3Path: args.s3Path },
      });
      if (!asset) {
        await logToolCall({ tool: 'media-get-asset', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Asset not found');
      }
      await logToolCall({ tool: 'media-get-asset', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: asset.s3Path });
      return jsonResult({ asset });
    }
  );
}
