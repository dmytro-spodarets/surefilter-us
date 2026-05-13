import 'server-only';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * MCP server global settings, persisted as a JSON column on the singleton
 * SiteSettings row (`SiteSettings.mcp`). Kept here rather than as a dedicated
 * Prisma model to mirror the pattern already used for redirects/footer/etc.
 */
export const McpSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  publicScopesEnabled: z.boolean().default(true),
  defaultTokenTtlDays: z.number().int().min(0).max(3650).default(90), // 0 = never
  defaultDailyQuota: z.number().int().min(1).max(1_000_000).default(10_000),
  rateLimitPerMinute: z.number().int().min(1).max(10_000).default(120),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().max(500).default('MCP server is temporarily unavailable for maintenance.'),
});

export type McpSettings = z.infer<typeof McpSettingsSchema>;

export const DEFAULT_MCP_SETTINGS: McpSettings = McpSettingsSchema.parse({});

export async function getMcpSettings(): Promise<McpSettings> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: 'site_settings' },
    select: { mcp: true },
  });
  if (!row?.mcp || typeof row.mcp !== 'object') return DEFAULT_MCP_SETTINGS;
  const parsed = McpSettingsSchema.safeParse(row.mcp);
  return parsed.success ? parsed.data : DEFAULT_MCP_SETTINGS;
}

export async function updateMcpSettings(patch: Partial<McpSettings>): Promise<McpSettings> {
  const current = await getMcpSettings();
  const next = McpSettingsSchema.parse({ ...current, ...patch });
  await prisma.siteSettings.upsert({
    where: { id: 'site_settings' },
    update: { mcp: next as any },
    create: { id: 'site_settings', mcp: next as any },
  });
  return next;
}
