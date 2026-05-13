import 'server-only';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { verifyToken } from '@/lib/api-token';
import { getMcpSettings } from '@/lib/mcp-settings';
import { mcpPublicLimiter, mcpAuthedLimiter, getClientIp } from '@/lib/rate-limiter';
import { registerCatalogTools } from '@/mcp/tools/catalog';
import { registerContentTools } from '@/mcp/tools/content';
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
    const burst = mcpAuthedLimiter.check(`mcp:authed:${bearerToken.slice(0, 16)}`);
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
  registerCatalogTools(server);
  registerContentTools(server);
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
