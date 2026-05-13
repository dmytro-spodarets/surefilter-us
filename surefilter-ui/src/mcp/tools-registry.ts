/**
 * Phase 0 stub: minimal tool catalog used by the Scopes Reference admin page
 * to show what each scope will unlock. Real tool handlers are wired up in
 * Phase 1+ in src/mcp/tools/*.ts; this registry stays the source of truth
 * for the "what is reachable" question.
 *
 * Each entry is purely descriptive — no execution logic here.
 */

import type { ScopeGroup } from './scopes';

export type MCPToolDescriptor = {
  name: string;
  description: string;
  requiredScopes: string[]; // matched via hasAllScopes()
  group: ScopeGroup;
  /**
   * 'live' = wired up on the MCP server right now (visible via tools/list).
   * 'planned' (default) = scheduled for a later phase, only shown in the
   * Scopes Reference admin page for transparency.
   */
  status?: 'live' | 'planned';
  /** Set when the tool mutates state — used by UI to flag destructive ops. */
  mutating?: boolean;
  /** Set when the tool requires confirm=true or Elicitation. */
  destructive?: boolean;
};

export const MCP_TOOLS: MCPToolDescriptor[] = [
  // ─────────── Public catalog (Phase 1 — live) ───────────
  {
    name: 'catalog-list-products',
    description: 'List/search products with filters (brand, category, filter type, status) and pagination. Public mode hides drafts/archived.',
    requiredScopes: ['catalog:read'],
    group: 'catalog',
    status: 'live',
  },
  {
    name: 'catalog-get-product',
    description: 'Get a single product by code or id, including specs/media/cross-references.',
    requiredScopes: ['catalog:read'],
    group: 'catalog',
    status: 'live',
  },
  {
    name: 'catalog-list-brands',
    description: 'List brands. Public mode returns active only; admin scope sees all.',
    requiredScopes: ['catalog:read'],
    group: 'catalog',
    status: 'live',
  },
  {
    name: 'catalog-list-categories',
    description: 'List product categories.',
    requiredScopes: ['catalog:read'],
    group: 'catalog',
    status: 'live',
  },
  {
    name: 'catalog-list-filter-types',
    description: 'List product filter types (Air/Oil/Fuel/Cabin, etc.).',
    requiredScopes: ['catalog:read'],
    group: 'catalog',
    status: 'live',
  },
  {
    name: 'catalog-list-spec-parameters',
    description: 'List spec parameters (e.g. outer diameter, height) optionally filtered by category.',
    requiredScopes: ['catalog:read'],
    group: 'catalog',
    status: 'live',
  },

  // ─────────── Content (Phase 1 — live) ───────────
  {
    name: 'content-list-news',
    description: 'List news + events with filters (type/category/search) and pagination. Public mode shows only PUBLISHED with publishedAt ≤ now.',
    requiredScopes: ['content:read'],
    group: 'content',
    status: 'live',
  },
  {
    name: 'content-get-news',
    description: 'Get a single news/event article by slug.',
    requiredScopes: ['content:read'],
    group: 'content',
    status: 'live',
  },
  {
    name: 'content-list-resource-categories',
    description: 'List resource categories as a tree (top-level + nested children with counts). Pass flat=true for a flat list.',
    requiredScopes: ['content:read'],
    group: 'content',
    status: 'live',
  },
  {
    name: 'content-list-resources',
    description: 'List resources with filters (category includes subcategory descendants; subcategory exact-match; search).',
    requiredScopes: ['content:read'],
    group: 'content',
    status: 'live',
  },
  {
    name: 'content-get-resource',
    description: 'Get a resource by slug. Returns canonical publicUrl (/resources/{parent?}/{cat}/{slug}).',
    requiredScopes: ['content:read'],
    group: 'content',
    status: 'live',
  },

  // ─────────── CMS read (Phase 2) ───────────
  {
    name: 'cms-list-pages',
    description: 'List all CMS pages including drafts.',
    requiredScopes: ['cms:read'],
    group: 'cms',
  },
  {
    name: 'cms-get-page',
    description: 'Get a page with its sections (draft data included).',
    requiredScopes: ['cms:read'],
    group: 'cms',
  },
  {
    name: 'cms-list-shared-sections',
    description: 'List reusable shared sections.',
    requiredScopes: ['cms:read'],
    group: 'cms',
  },

  // ─────────── Forms / Submissions (Phase 2) ───────────
  {
    name: 'forms-list',
    description: 'List form definitions.',
    requiredScopes: ['forms:read'],
    group: 'forms',
  },
  {
    name: 'forms-get',
    description: 'Get a form definition (fields, webhookUrl masked).',
    requiredScopes: ['forms:read'],
    group: 'forms',
  },
  {
    name: 'form-submissions-list',
    description: 'List form submissions with filters.',
    requiredScopes: ['submissions:read'],
    group: 'submissions',
  },

  // ─────────── Banners (Phase 2) ───────────
  {
    name: 'banners-list',
    description: 'List popup banners.',
    requiredScopes: ['banners:read'],
    group: 'banners',
  },
  {
    name: 'banner-stats-get',
    description: 'Per-banner stats: impressions, clicks, submissions over time.',
    requiredScopes: ['banners:read'],
    group: 'banners',
  },

  // ─────────── Media (Phase 2) ───────────
  {
    name: 'media-list-files',
    description: 'List files in a media library folder.',
    requiredScopes: ['media:read'],
    group: 'media',
  },

  // ─────────── Settings / Users / Analytics ───────────
  {
    name: 'settings-get',
    description: 'Read SiteSettings (some sensitive fields redacted unless paired with admin:*).',
    requiredScopes: ['settings:read'],
    group: 'settings',
  },
  {
    name: 'users-list',
    description: 'List admin users (emails partially masked unless paired with admin:*).',
    requiredScopes: ['users:read'],
    group: 'users',
  },
  {
    name: 'analytics-recent-logs',
    description: 'Read recent AdminLog entries with filters.',
    requiredScopes: ['analytics:read'],
    group: 'analytics',
  },

  // ─────────── Writes (Phase 3) ───────────
  {
    name: 'catalog-create-product',
    description: 'Create a new product with optional categories/specs/media/cross-refs.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    mutating: true,
  },
  {
    name: 'catalog-update-product',
    description: 'Update an existing product.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    mutating: true,
  },
  {
    name: 'catalog-delete-product',
    description: 'Delete a product. Requires confirm:true or Elicitation.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    mutating: true,
    destructive: true,
  },
  {
    name: 'content-create-news',
    description: 'Create a draft news/event article.',
    requiredScopes: ['content:write'],
    group: 'content',
    mutating: true,
  },
  {
    name: 'content-publish-news',
    description: 'Publish or archive a news/event article.',
    requiredScopes: ['content:publish'],
    group: 'content',
    mutating: true,
  },
  {
    name: 'content-create-resource',
    description: 'Create a draft resource (in any category, top-level or subcategory).',
    requiredScopes: ['content:write'],
    group: 'content',
    mutating: true,
  },
  {
    name: 'content-create-resource-category',
    description: 'Create a resource category (top-level or subcategory; max depth = 2 enforced).',
    requiredScopes: ['content:write'],
    group: 'content',
    mutating: true,
  },
  {
    name: 'cms-update-page',
    description: 'Update a CMS page (sections, metadata). Affects public site after publish.',
    requiredScopes: ['cms:write'],
    group: 'cms',
    mutating: true,
  },
  {
    name: 'cms-publish-page',
    description: 'Publish or unpublish a CMS page. Always requires Elicitation.',
    requiredScopes: ['cms:publish'],
    group: 'cms',
    mutating: true,
    destructive: true,
  },
  {
    name: 'banners-publish',
    description: 'Publish, schedule, pause or archive a banner.',
    requiredScopes: ['banners:publish'],
    group: 'banners',
    mutating: true,
  },
  {
    name: 'media-presign-upload',
    description: 'Issue a presigned S3 upload URL.',
    requiredScopes: ['media:write'],
    group: 'media',
    mutating: true,
  },
  {
    name: 'media-delete-file',
    description: 'Delete a file from S3. Always requires Elicitation.',
    requiredScopes: ['media:delete'],
    group: 'media',
    mutating: true,
    destructive: true,
  },
  {
    name: 'settings-update',
    description: 'Update SiteSettings. Always requires admin:* + Elicitation.',
    requiredScopes: ['settings:write'],
    group: 'settings',
    mutating: true,
    destructive: true,
  },
  {
    name: 'users-create',
    description: 'Create a new admin user. Always requires admin:* + Elicitation.',
    requiredScopes: ['users:write'],
    group: 'users',
    mutating: true,
    destructive: true,
  },
  {
    name: 'submissions-export-csv',
    description: 'Export submissions as CSV. Rate-limited; contains PII.',
    requiredScopes: ['submissions:export'],
    group: 'submissions',
    mutating: false,
  },
  {
    name: 'cache-purge',
    description: 'Force ISR + CloudFront cache invalidation.',
    requiredScopes: ['cache:purge'],
    group: 'cache',
    mutating: true,
  },
];

/** Tools unlocked by a given concrete scope or wildcard. */
export function toolsForScope(scope: string): MCPToolDescriptor[] {
  if (scope === 'admin:*') return MCP_TOOLS;
  return MCP_TOOLS.filter((t) =>
    t.requiredScopes.some((req) => {
      if (req === scope) return true;
      // domain:* unlocks every tool in that domain
      if (scope.endsWith(':*')) {
        const domain = scope.slice(0, -2);
        return req.startsWith(`${domain}:`);
      }
      return false;
    })
  );
}
