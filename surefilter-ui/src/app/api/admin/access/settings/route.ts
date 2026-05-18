import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { getMcpSettings, updateMcpSettings, McpSettingsSchema } from '@/lib/mcp-settings';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

export async function GET() {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const settings = await getMcpSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const body = await request.json();
    const data = McpSettingsSchema.partial().parse(body);

    const before = await getMcpSettings();
    const after = await updateMcpSettings(data);

    const metadata = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'MCP_SETTINGS_UPDATED',
      entityType: 'SiteSettings',
      entityId: 'site_settings',
      entityName: 'MCP settings',
      details: { before, after, changes: Object.keys(data) },
      ...metadata,
    });

    return NextResponse.json(after);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update MCP settings', details: error.message ?? String(error) },
      { status: 400 }
    );
  }
}
