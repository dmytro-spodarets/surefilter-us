import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { initializeMcpServer, verifyApiKey, checkServerAvailability } from '@/mcp/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const mcpHandler = createMcpHandler(
  initializeMcpServer,
  {
    serverInfo: {
      name: 'sure-filter-us',
      version: '0.1.0',
    },
  },
  {
    basePath: '/api/mcp',
    verboseLogs: process.env.NODE_ENV !== 'production',
    // Phase 1 ships single-instance; Phase 5 will wire Redis when we move to multi-instance.
    redisUrl: process.env.REDIS_URL || process.env.KV_URL,
  }
);

const authedHandler = withMcpAuth(mcpHandler, verifyApiKey, {
  required: true,
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
});

async function dispatch(req: Request): Promise<Response> {
  const block = await checkServerAvailability();
  if (block) return block;
  return authedHandler(req);
}

export { dispatch as GET, dispatch as POST, dispatch as DELETE };
