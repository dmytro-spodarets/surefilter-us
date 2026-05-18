import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { invalidatePages } from '@/lib/revalidate';
import { authContext, jsonResult, errorResult, type ExtraContext } from '@/mcp/tools/_helpers';
import { mutationCommonFields, requireWriteScope, auditMutation } from '@/mcp/tools/_write-helpers';

export function registerOperationsTools(server: McpServer) {
  server.registerTool(
    'cache-purge',
    {
      description:
        'Force ISR + CloudFront cache invalidation for the given paths. Use sparingly — most write tools already invalidate touched paths. Requires cache:purge.',
      inputSchema: {
        paths: z.array(z.string().min(1)).min(1).max(50).describe('e.g. ["/", "/newsroom", "/products/SFO241"]'),
        tags: z.array(z.string().min(1)).optional().describe('Optional Next.js cache tags to invalidate alongside paths.'),
        ...mutationCommonFields,
      },
    },
    async (args, extra) => {
      const ctx = authContext(extra as ExtraContext);
      const deny = await requireWriteScope(ctx, 'cache:purge', 'cache-purge', args);
      if (deny) return deny;
      try {
        await invalidatePages(args.paths, args.tags);
      } catch (e: any) {
        return errorResult(`Cache invalidation failed: ${e?.message ?? String(e)}`);
      }
      await auditMutation({
        ctx, tool: 'cache-purge', action: 'UPDATE',
        entityType: 'Cache', entityId: 'cloudfront', entityName: `${args.paths.length} paths`,
        details: { paths: args.paths, tags: args.tags ?? [] },
        params: args,
      });
      return jsonResult({ ok: true, paths: args.paths, tags: args.tags ?? [] });
    }
  );
}
