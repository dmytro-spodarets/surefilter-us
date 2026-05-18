import 'server-only';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { verifyToken } from '@/lib/api-token';
import { getMcpSettings } from '@/lib/mcp-settings';
import { mcpPublicLimiter, getMcpAuthedLimiter, getClientIp } from '@/lib/rate-limiter';
import { registerCatalogTools } from '@/mcp/tools/catalog';
import { registerContentTools } from '@/mcp/tools/content';
import { registerCmsTools } from '@/mcp/tools/cms';
import { registerFormsTools } from '@/mcp/tools/forms';
import { registerBannersTools } from '@/mcp/tools/banners';
import { registerMediaTools } from '@/mcp/tools/media';
import { registerUsersTools } from '@/mcp/tools/users';
import { registerAdminTools } from '@/mcp/tools/admin';
import { registerContentWriteTools } from '@/mcp/tools/content-writes';
import { registerCatalogWriteTools } from '@/mcp/tools/catalog-writes';
import { registerOperationsTools } from '@/mcp/tools/operations';
import { registerBannersWriteTools } from '@/mcp/tools/banners-writes';
import { registerCmsWriteTools } from '@/mcp/tools/cms-writes';
import { registerFormsWriteTools } from '@/mcp/tools/forms-writes';
import { registerMediaWriteTools } from '@/mcp/tools/media-writes';
import { registerUsersWriteTools } from '@/mcp/tools/users-writes';
import { registerAdminWriteTools } from '@/mcp/tools/admin-writes';
import { registerMcpResources } from '@/mcp/resources';

const PUBLIC_SCOPES = ['public:catalog', 'public:content', 'public:cms'];

/**
 * Extract a bearer token from the Authorization header, if any.
 * mcp-handler's withMcpAuth also extracts and passes it as the second arg,
 * but we re-export this for unit tests / manual checks.
 */
export function extractBearer(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null;
  return value.trim();
}

/**
 * MCP token verifier. Resolves to an AuthInfo (token or anonymous-public) or
 * `undefined` to trigger a 401 from withMcpAuth.
 *
 * Behavior:
 * - Disabled / maintenance → undefined (callers see 401; the route-level guard
 *   intercepts these before withMcpAuth so a 503 is returned with a message).
 * - Bearer present + valid → AuthInfo with token scopes, `extra.tokenId` and
 *   `extra.userId` set.
 * - Bearer present + invalid/revoked/expired/quota → undefined → 401.
 * - No bearer + publicScopesEnabled → anonymous AuthInfo with PUBLIC_SCOPES.
 * - No bearer + publicScopesDisabled → undefined → 401.
 */
export async function verifyApiKey(req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  const settings = await getMcpSettings();
  if (!settings.enabled || settings.maintenanceMode) return undefined;

  const ip = getClientIp(req);

  if (bearerToken) {
    // Burst limiter driven by mcpSettings.rateLimitPerMinute — keyed on the
    // first 16 chars of the bearer to avoid a DB hit before the rate-limit check.
    const burstLimiter = getMcpAuthedLimiter(settings.rateLimitPerMinute);
    const burst = burstLimiter.check(`mcp:authed:${bearerToken.slice(0, 16)}`);
    if (!burst.allowed) return undefined;
    const result = await verifyToken(bearerToken, { ip });
    if (!result.ok) return undefined;
    return {
      token: bearerToken,
      clientId: result.token.id,
      scopes: result.token.scopes,
      expiresAt: result.token.expiresAt ? Math.floor(result.token.expiresAt.getTime() / 1000) : undefined,
      extra: {
        tokenId: result.token.id,
        userId: result.token.userId,
        name: result.token.name,
        ip,
      },
    };
  }

  if (!settings.publicScopesEnabled) return undefined;

  const burst = mcpPublicLimiter.check(`mcp:public:${ip}`);
  if (!burst.allowed) return undefined;

  return {
    token: '',
    clientId: 'anonymous',
    scopes: PUBLIC_SCOPES,
    extra: { tokenId: null, userId: null, ip },
  };
}

/**
 * Register all tools, resources, and (later) prompts on the MCP server.
 * Called once per session by mcp-handler.
 */
export function initializeMcpServer(server: McpServer) {
  // Phase 1 — public + mixed-mode read
  registerCatalogTools(server);
  registerContentTools(server);
  // Phase 2 — admin read
  registerCmsTools(server);
  registerFormsTools(server);
  registerBannersTools(server);
  registerMediaTools(server);
  registerUsersTools(server);
  registerAdminTools(server);
  // Phase 3a — content + catalog writes + ops
  registerContentWriteTools(server);
  registerCatalogWriteTools(server);
  registerOperationsTools(server);
  // Phase 3b — banners / cms / forms / media / users / settings writes + export
  registerBannersWriteTools(server);
  registerCmsWriteTools(server);
  registerFormsWriteTools(server);
  registerMediaWriteTools(server);
  registerUsersWriteTools(server);
  registerAdminWriteTools(server);
  // Resources (Phase 1)
  registerMcpResources(server);
}

/**
 * Server-level guard executed before withMcpAuth.
 * Returns null if the request should proceed, or a Response to short-circuit.
 */
export async function checkServerAvailability(): Promise<Response | null> {
  const settings = await getMcpSettings();
  if (!settings.enabled) {
    return Response.json({ error: 'MCP server is disabled' }, { status: 503 });
  }
  if (settings.maintenanceMode) {
    return Response.json(
      { error: settings.maintenanceMessage || 'MCP server is in maintenance mode' },
      { status: 503, headers: { 'Retry-After': '60' } }
    );
  }
  return null;
}
