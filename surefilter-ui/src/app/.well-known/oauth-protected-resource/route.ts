import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from 'mcp-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * RFC 9728 — OAuth 2.0 Protected Resource Metadata.
 *
 * Phase 1 ships with an empty `authorization_servers` list because the MCP
 * server currently authenticates via Personal Access Tokens (PATs) issued in
 * /admin/access. The endpoint exists so MCP clients that hit a 401 + receive a
 * WWW-Authenticate with `resource_metadata` URL can fetch this document and
 * report a clean "this server uses bearer tokens, no OAuth flow" state.
 *
 * Phase 6 will populate `authServerUrls` once an OAuth 2.1 Authorization
 * Server (NextAuth-based or external) is provisioned.
 */
const handler = protectedResourceHandler({ authServerUrls: [] });
const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
