import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/prisma';
import { logToolCall } from '@/mcp/audit';
import { authContext, jsonResult, errorResult, requireScope, type ExtraContext } from '@/mcp/tools/_helpers';

/** Redact webhook URLs + notification emails for callers without admin:*. */
function redactForm<T extends { webhookUrl?: string | null; webhookHeaders?: any; notifyEmail?: string | null }>(form: T, elevated: boolean): T {
  if (elevated) return form;
  return {
    ...form,
    webhookUrl: form.webhookUrl ? '<redacted>' : null,
    webhookHeaders: form.webhookHeaders ? '<redacted>' : null,
    notifyEmail: form.notifyEmail ? '<redacted>' : null,
  } as T;
}

export function registerFormsTools(server: McpServer) {
  // ─────────── forms-list ───────────
  server.registerTool(
    'forms-list',
    {
      description:
        'List form definitions (forms:read). webhookUrl / notifyEmail are redacted unless the token carries admin:*.',
      inputSchema: {
        type: z.enum(['DOWNLOAD', 'CONTACT']).optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'forms:read', 'forms-list', args);
      if (deny) return deny;

      const where: any = {};
      if (args.type) where.type = args.type;
      if (args.isActive !== undefined) where.isActive = args.isActive;
      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: 'insensitive' } },
          { slug: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.form.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: args.limit,
          select: {
            id: true, name: true, slug: true, description: true, type: true, isActive: true,
            successTitle: true, successMessage: true, redirectUrl: true,
            webhookUrl: true, webhookHeaders: true, notifyEmail: true,
            createdAt: true, updatedAt: true,
            _count: { select: { submissions: true } },
          },
        }),
        prisma.form.count({ where }),
      ]);

      const redacted = items.map((f) => redactForm(f, ctx.elevated));
      await logToolCall({ tool: 'forms-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, forms: redacted });
    }
  );

  // ─────────── forms-get ───────────
  server.registerTool(
    'forms-get',
    {
      description: 'Get a form by slug or id, including its field definitions (fields[] JSON).',
      inputSchema: {
        slug: z.string().optional(),
        id: z.string().optional(),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'forms:read', 'forms-get', args);
      if (deny) return deny;
      if (!args.slug && !args.id) return errorResult('Either `slug` or `id` is required');

      const form = await prisma.form.findFirst({
        where: args.slug ? { slug: args.slug } : { id: args.id },
        include: {
          _count: { select: { submissions: true } },
        },
      });
      if (!form) {
        await logToolCall({ tool: 'forms-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Form not found');
      }
      await logToolCall({ tool: 'forms-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: form.slug });
      return jsonResult({ form: redactForm(form, ctx.elevated) });
    }
  );

  // ─────────── form-submissions-list ───────────
  server.registerTool(
    'form-submissions-list',
    {
      description:
        'List form submissions (submissions:read). PII (email, IP, full data JSON) included as-is. To bulk export → use submissions-export-csv (Phase 3).',
      inputSchema: {
        formId: z.string().optional(),
        formSlug: z.string().optional(),
        emailSent: z.boolean().optional(),
        webhookSent: z.boolean().optional(),
        since: z.string().datetime().optional().describe('ISO timestamp, lower bound on createdAt'),
        until: z.string().datetime().optional().describe('ISO timestamp, upper bound on createdAt'),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(25),
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'submissions:read', 'form-submissions-list', args);
      if (deny) return deny;

      const where: any = {};
      if (args.formId) where.formId = args.formId;
      if (args.formSlug) where.form = { slug: args.formSlug };
      if (args.emailSent !== undefined) where.emailSent = args.emailSent;
      if (args.webhookSent !== undefined) where.webhookSent = args.webhookSent;
      if (args.since || args.until) {
        where.createdAt = {};
        if (args.since) where.createdAt.gte = new Date(args.since);
        if (args.until) where.createdAt.lte = new Date(args.until);
      }

      const skip = (args.page - 1) * args.limit;
      const [items, total] = await Promise.all([
        prisma.formSubmission.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: args.limit,
          select: {
            id: true, formId: true, data: true, ipAddress: true, userAgent: true, referer: true,
            emailSent: true, emailError: true, webhookSent: true, webhookError: true, webhookAttempts: true,
            createdAt: true,
            form: { select: { id: true, name: true, slug: true, type: true } },
          },
        }),
        prisma.formSubmission.count({ where }),
      ]);

      await logToolCall({ tool: 'form-submissions-list', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: `${items.length}/${total}` });
      return jsonResult({ pagination: { page: args.page, limit: args.limit, total, totalPages: Math.ceil(total / args.limit) }, submissions: items });
    }
  );

  // ─────────── form-submissions-get ───────────
  server.registerTool(
    'form-submissions-get',
    {
      description: 'Get a single form submission by id (submissions:read).',
      inputSchema: { id: z.string().min(1) },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireScope(ctx, 'submissions:read', 'form-submissions-get', args);
      if (deny) return deny;

      const submission = await prisma.formSubmission.findUnique({
        where: { id: args.id },
        include: { form: { select: { id: true, name: true, slug: true, type: true } } },
      });
      if (!submission) {
        await logToolCall({ tool: 'form-submissions-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: 'not_found' });
        return errorResult('Submission not found');
      }
      await logToolCall({ tool: 'form-submissions-get', scopes: ctx.scopes, status: 'ok', clientId: ctx.clientId, tokenId: ctx.tokenId, userId: ctx.userId, ip: ctx.ip, params: args, resultSummary: submission.id });
      return jsonResult({ submission });
    }
  );
}
