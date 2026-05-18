import 'server-only';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { hasScope } from '@/lib/api-token';
import { authContext, jsonResult, errorResult, type ExtraContext, maskEmail } from '@/mcp/tools/_helpers';
import {
  mutationCommonFields,
  requireWriteScope,
  requireConfirm,
  auditMutation,
} from '@/mcp/tools/_write-helpers';

/**
 * Users writes require BOTH users:write (for the scope grant)
 * AND admin:* (super-wildcard) on the calling token. Mirrors the high-risk
 * gate described in the original MCP plan — privilege escalation needs both.
 */
async function gateAdminStar(scopes: string[]) {
  if (!hasScope(scopes, 'admin:*')) {
    return errorResult('Users writes are restricted to tokens with admin:* (not just users:write).');
  }
  return null;
}

export function registerUsersWriteTools(server: McpServer) {
  server.registerTool(
    'users-create',
    {
      description:
        'Create an admin user. Returns the new user (without passwordHash). Requires users:write AND admin:* AND confirm:true.',
      inputSchema: {
        email: z.string().email(),
        password: z.string().min(8).describe('Sent over the wire only here — bcrypt-hashed before storage.'),
        name: z.string().min(1),
        role: z.enum(['ADMIN', 'USER']).optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'users:write', 'users-create', { ...args, password: '<redacted>' });
      if (deny) return deny;
      const adminGate = await gateAdminStar(ctx.scopes);
      if (adminGate) return adminGate;
      const needConfirm = requireConfirm(args, 'create user', `User:${args.email}`);
      if (needConfirm) return needConfirm;

      const dup = await prisma.user.findUnique({ where: { email: args.email } });
      if (dup) return errorResult('A user with this email already exists');
      const passwordHash = await bcrypt.hash(args.password, 10);
      const user = await prisma.user.create({
        data: { email: args.email, passwordHash, name: args.name, role: args.role ?? 'USER', isActive: args.isActive ?? true },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      });
      await auditMutation({
        ctx, tool: 'users-create', action: 'CREATE',
        entityType: 'User', entityId: user.id, entityName: user.email,
        details: { role: user.role, isActive: user.isActive },
        params: { email: args.email, name: args.name, role: args.role }, // password is NOT in params (logToolCall would redact anyway)
      });
      return jsonResult({ user: { ...user, email: ctx.elevated ? user.email : maskEmail(user.email) } });
    }
  );

  server.registerTool(
    'users-update',
    {
      description:
        'Update a user (name / role / isActive / password). Requires users:write AND admin:*. Password change requires confirm:true.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().optional(),
        role: z.enum(['ADMIN', 'USER']).optional(),
        isActive: z.boolean().optional(),
        password: z.string().min(8).optional().describe('When set, replaces passwordHash (bcrypt).'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const safeParams = { ...args, password: args.password ? '<redacted>' : undefined };
      const deny = await requireWriteScope(ctx, 'users:write', 'users-update', safeParams);
      if (deny) return deny;
      const adminGate = await gateAdminStar(ctx.scopes);
      if (adminGate) return adminGate;
      if (args.password) {
        const needConfirm = requireConfirm(args, 'reset password', `User:${args.id}`);
        if (needConfirm) return needConfirm;
      }

      const existing = await prisma.user.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('User not found');

      // Safety: do not allow demoting the last active ADMIN.
      if ((args.role === 'USER' || args.isActive === false) && existing.role === 'ADMIN') {
        const remainingAdmins = await prisma.user.count({ where: { role: 'ADMIN', isActive: true, id: { not: existing.id } } });
        if (remainingAdmins === 0) {
          return errorResult('Refusing to demote/disable the last active ADMIN');
        }
      }

      const { id, confirm: _c, idempotencyKey: _i, password, ...patch } = args;
      const data: any = { ...patch };
      if (password) data.passwordHash = await bcrypt.hash(password, 10);

      const updated = await prisma.user.update({
        where: { id }, data,
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      });
      await auditMutation({
        ctx, tool: 'users-update', action: 'UPDATE',
        entityType: 'User', entityId: id, entityName: updated.email,
        details: { changes: Object.keys(patch).concat(password ? ['password'] : []) },
        params: safeParams,
      });
      return jsonResult({ user: { ...updated, email: ctx.elevated ? updated.email : maskEmail(updated.email) } });
    }
  );

  server.registerTool(
    'users-delete',
    {
      description:
        'Delete a user. AdminLog rows referencing this user cascade-delete. Refuses to delete the last active ADMIN. Requires users:write AND admin:* AND confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'users:write', 'users-delete', args);
      if (deny) return deny;
      const adminGate = await gateAdminStar(ctx.scopes);
      if (adminGate) return adminGate;
      const needConfirm = requireConfirm(args, 'delete', `User:${args.id}`);
      if (needConfirm) return needConfirm;

      const existing = await prisma.user.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('User not found');
      if (existing.role === 'ADMIN') {
        const remaining = await prisma.user.count({ where: { role: 'ADMIN', isActive: true, id: { not: existing.id } } });
        if (remaining === 0) return errorResult('Refusing to delete the last active ADMIN');
      }
      await prisma.user.delete({ where: { id: args.id } });
      await auditMutation({
        ctx, tool: 'users-delete', action: 'DELETE',
        entityType: 'User', entityId: existing.id, entityName: existing.email,
        details: { role: existing.role },
      });
      return jsonResult({ deleted: existing.id });
    }
  );
}
