import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { validateWebhookUrl } from '@/lib/webhook';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';
import {
  mutationCommonFields,
  requireWriteScope,
  requireConfirm,
  auditMutation,
} from '@/mcp/tools/_write-helpers';

const FormType = z.enum(['DOWNLOAD', 'CONTACT']);

/**
 * SSRF guard for webhookUrl. Throws on invalid input — caller wraps in try/catch.
 * Same policy as listmonk webhook / form submission flow: https only,
 * blocks private/internal IPs.
 */
function ssrfCheck(rawUrl: string | null | undefined): string | null | { error: string } {
  if (rawUrl === null || rawUrl === undefined || rawUrl === '') return null;
  try {
    return validateWebhookUrl(rawUrl);
  } catch (e: any) {
    return { error: e?.message ?? 'Invalid webhook URL' };
  }
}

export function registerFormsWriteTools(server: McpServer) {
  // ─────────── Form CRUD ───────────
  server.registerTool(
    'forms-create',
    {
      description:
        'Create a form definition. `fields` is a JSON array of field defs (validated by the public submit endpoint, not enforced here). `webhookUrl` must be https + not private-IP (server-side SSRF guard).',
      inputSchema: {
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().nullable().optional(),
        type: FormType.optional(),
        fields: z.any().describe('Array of field definitions: [{ id, type, label, required, options? }, ...]'),
        successTitle: z.string().nullable().optional(),
        successMessage: z.string().nullable().optional(),
        redirectUrl: z.string().nullable().optional(),
        webhookUrl: z.string().url().nullable().optional(),
        webhookHeaders: z.record(z.string(), z.string()).nullable().optional(),
        notifyEmail: z.string().email().nullable().optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'forms:write', 'forms-create', args);
      if (deny) return deny;
      const dup = await prisma.form.findUnique({ where: { slug: args.slug } });
      if (dup) return errorResult('A form with this slug already exists');

      const sanitizedWebhook = ssrfCheck(args.webhookUrl);
      if (sanitizedWebhook && typeof sanitizedWebhook === 'object') {
        return errorResult(`webhookUrl rejected: ${sanitizedWebhook.error}`);
      }

      const { confirm: _c, idempotencyKey: _i, webhookUrl: _w, ...rest } = args;
      const created = await prisma.form.create({
        data: {
          ...rest,
          type: rest.type ?? 'CONTACT',
          isActive: rest.isActive ?? true,
          webhookUrl: (sanitizedWebhook as string | null) ?? null,
        } as any,
      });
      await auditMutation({ ctx, tool: 'forms-create', action: 'CREATE', entityType: 'Form', entityId: created.id, entityName: created.slug, details: { type: created.type, hasWebhook: !!created.webhookUrl } });
      return jsonResult({ form: created });
    }
  );

  server.registerTool(
    'forms-update',
    {
      description:
        'Update a form (partial). webhookUrl is SSRF-validated again on update. Pass `webhookUrl: null` to clear it.',
      inputSchema: {
        id: z.string().min(1),
        name: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().nullable().optional(),
        type: FormType.optional(),
        fields: z.any().optional(),
        successTitle: z.string().nullable().optional(),
        successMessage: z.string().nullable().optional(),
        redirectUrl: z.string().nullable().optional(),
        webhookUrl: z.string().url().nullable().optional(),
        webhookHeaders: z.record(z.string(), z.string()).nullable().optional(),
        notifyEmail: z.string().email().nullable().optional(),
        isActive: z.boolean().optional(),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'forms:write', 'forms-update', args);
      if (deny) return deny;
      const existing = await prisma.form.findUnique({ where: { id: args.id } });
      if (!existing) return errorResult('Form not found');

      const { id, confirm: _c, idempotencyKey: _i, webhookUrl, ...patch } = args;
      const data: any = { ...patch };
      if (webhookUrl !== undefined) {
        const sanitized = ssrfCheck(webhookUrl);
        if (sanitized && typeof sanitized === 'object') {
          return errorResult(`webhookUrl rejected: ${sanitized.error}`);
        }
        data.webhookUrl = sanitized as string | null;
      }

      const updated = await prisma.form.update({ where: { id }, data });
      await auditMutation({ ctx, tool: 'forms-update', action: 'UPDATE', entityType: 'Form', entityId: id, entityName: updated.slug, details: { changes: Object.keys(data) } });
      return jsonResult({ form: updated });
    }
  );

  server.registerTool(
    'forms-delete',
    {
      description: 'Delete a form. Fails if any submissions or resources reference it. Requires confirm:true.',
      inputSchema: { id: z.string().min(1), ...mutationCommonFields },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'forms:write', 'forms-delete', args);
      if (deny) return deny;
      const needConfirm = requireConfirm(args, 'delete', `Form:${args.id}`);
      if (needConfirm) return needConfirm;
      const existing = await prisma.form.findUnique({
        where: { id: args.id },
        include: { _count: { select: { submissions: true, resources: true } } },
      });
      if (!existing) return errorResult('Form not found');
      if (existing._count.submissions > 0 || existing._count.resources > 0) {
        return errorResult(
          `Form is in use (${existing._count.submissions} submissions, ${existing._count.resources} resources) — archive instead of delete, or reassign references first.`
        );
      }
      await prisma.form.delete({ where: { id: args.id } });
      await auditMutation({ ctx, tool: 'forms-delete', action: 'DELETE', entityType: 'Form', entityId: existing.id, entityName: existing.slug });
      return jsonResult({ deleted: existing.id });
    }
  );
}
