import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, requireScope, maskEmail, type ExtraContext } from '@/mcp/tools/_helpers';

function shapeUser(
  u: { id: string; email: string; name: string | null; role: string; isActive: boolean; createdAt: Date; updatedAt: Date },
  elevated: boolean
) {
  return {
    id: u.id,
    email: elevated ? u.email : maskEmail(u.email),
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function registerUsersTools(server: McpServer) {
  // ─────────── users-list ───────────
  server.registerTool(
    'users-list',
    {
      description:
        'List admin users (users:read). Emails are masked (j***e@example.com) unless the calling token carries admin:*.',
      inputSchema: {
        role: z.enum(['ADMIN', 'USER']).optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(200).default(50),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'users:read', 'users-list', args);
      if (deny) return deny;

      const where: any = {};
      if (args.role) where.role = args.role;
      if (args.isActive !== undefined) where.isActive = args.isActive;
      if (args.search) {
        where.OR = [
          { email: { contains: args.search, mode: 'insensitive' } },
          { name: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: args.limit,
          select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
        }),
        prisma.user.count({ where }),
      ]);

      await logToolCall({ tool: 'users-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({
        elevated: ctx.elevated,
        pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) },
        users: items.map((u) => shapeUser(u, ctx.elevated)),
      });
    }
  );

  // ─────────── users-get ───────────
  server.registerTool(
    'users-get',
    {
      description: 'Get a single user by id or email (users:read). Email masked unless admin:*.',
      inputSchema: {
        id: z.string().optional(),
        email: z.string().email().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'users:read', 'users-get', args);
      if (deny) return deny;
      if (!args.id && !args.email) return errorResult('Either `id` or `email` is required');

      const user = await prisma.user.findFirst({
        where: args.id ? { id: args.id } : { email: args.email },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      });
      if (!user) {
        await logToolCall({ tool: 'users-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('User not found');
      }
      await logToolCall({ tool: 'users-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: user.id });
      return jsonResult({ elevated: ctx.elevated, user: shapeUser(user, ctx.elevated) });
    }
  );
}
