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

  // ─────────── CMS read (Phase 2 — live) ───────────
  {
    name: 'cms-list-pages',
    description: 'List CMS pages. Public mode shows only published; cms:read sees drafts. Paginated.',
    requiredScopes: ['cms:read'],
    group: 'cms',
    status: 'live',
  },
  {
    name: 'cms-get-page',
    description: 'Get a CMS page by slug with its sections in display order. Public mode requires status=published.',
    requiredScopes: ['cms:read'],
    group: 'cms',
    status: 'live',
  },
  {
    name: 'cms-list-shared-sections',
    description: 'List reusable shared sections (admin only).',
    requiredScopes: ['cms:read'],
    group: 'cms',
    status: 'live',
  },

  // ─────────── Forms / Submissions (Phase 2 — live) ───────────
  {
    name: 'forms-list',
    description: 'List form definitions. webhookUrl / notifyEmail redacted unless admin:*.',
    requiredScopes: ['forms:read'],
    group: 'forms',
    status: 'live',
  },
  {
    name: 'forms-get',
    description: 'Get a form by slug or id, including its field definitions. Secrets redacted unless admin:*.',
    requiredScopes: ['forms:read'],
    group: 'forms',
    status: 'live',
  },
  {
    name: 'form-submissions-list',
    description: 'List form submissions (PII: email, IP, full data JSON). Filter by formId/formSlug/date/email-sent/webhook-sent.',
    requiredScopes: ['submissions:read'],
    group: 'submissions',
    status: 'live',
  },
  {
    name: 'form-submissions-get',
    description: 'Get a single form submission by id.',
    requiredScopes: ['submissions:read'],
    group: 'submissions',
    status: 'live',
  },

  // ─────────── Banners (Phase 2 — live) ───────────
  {
    name: 'banners-list',
    description: 'List popup banners with filters (status/type/campaign/search). Includes denormalized counters. notifyEmail redacted unless admin:*.',
    requiredScopes: ['banners:read'],
    group: 'banners',
    status: 'live',
  },
  {
    name: 'banners-get',
    description: 'Get a banner by slug or id with full layoutConfig + targeting rules.',
    requiredScopes: ['banners:read'],
    group: 'banners',
    status: 'live',
  },
  {
    name: 'banner-stats-get',
    description: 'Per-banner stats: totals + daily timeseries (impressions / clicks / submissions) for last N days.',
    requiredScopes: ['banners:read'],
    group: 'banners',
    status: 'live',
  },
  {
    name: 'banner-campaigns-list',
    description: 'List banner campaigns. notifyEmail redacted unless admin:*.',
    requiredScopes: ['banners:read'],
    group: 'banners',
    status: 'live',
  },
  {
    name: 'banner-submissions-list',
    description: 'List banner lead-capture submissions (PII: email + UTM + IP). Use submissions-export-csv (Phase 3) for bulk.',
    requiredScopes: ['submissions:read'],
    group: 'submissions',
    status: 'live',
  },

  // ─────────── Media (Phase 2 — live) ───────────
  {
    name: 'media-list-files',
    description: 'List files in an S3 media library folder (prefix-scoped). Merges S3 objects with MediaAsset metadata.',
    requiredScopes: ['media:read'],
    group: 'media',
    status: 'live',
  },
  {
    name: 'media-get-asset',
    description: 'Get a MediaAsset row by id or s3Path.',
    requiredScopes: ['media:read'],
    group: 'media',
    status: 'live',
  },

  // ─────────── Settings / Users / Analytics (Phase 2 — live) ───────────
  {
    name: 'settings-get',
    description: 'Read SiteSettings + MCP global settings. Sensitive fields redacted unless admin:*.',
    requiredScopes: ['settings:read'],
    group: 'settings',
    status: 'live',
  },
  {
    name: 'users-list',
    description: 'List admin users. Emails masked (j***e@example.com) unless admin:*.',
    requiredScopes: ['users:read'],
    group: 'users',
    status: 'live',
  },
  {
    name: 'users-get',
    description: 'Get a user by id or email. Email masked unless admin:*.',
    requiredScopes: ['users:read'],
    group: 'users',
    status: 'live',
  },
  {
    name: 'analytics-logs-list',
    description: 'List AdminLog entries with filters (userId / action / entityType / date). Useful for auditing MCP_TOOL_CALL activity.',
    requiredScopes: ['analytics:read'],
    group: 'analytics',
    status: 'live',
  },

  // ─────────── Catalog writes (Phase 3 — live) ───────────
  {
    name: 'catalog-create-brand',
    description: 'Create a product brand.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    status: 'live',
    mutating: true,
  },
  {
    name: 'catalog-update-brand',
    description: 'Update a brand.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    status: 'live',
    mutating: true,
  },
  {
    name: 'catalog-delete-brand',
    description: 'Delete a brand (fails if any products reference it). Requires confirm:true.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'catalog-create-product',
    description: 'Create a product with optional category assignments / spec values / media / cross-references.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    status: 'live',
    mutating: true,
  },
  {
    name: 'catalog-update-product',
    description: 'Update a product. Optional collections (categoryAssignments / specValues / mediaItems / crossReferences) are REPLACED in full when passed.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    status: 'live',
    mutating: true,
  },
  {
    name: 'catalog-delete-product',
    description: 'Delete a product (cascade deletes related rows). Requires confirm:true.',
    requiredScopes: ['catalog:write'],
    group: 'catalog',
    status: 'live',
    mutating: true,
    destructive: true,
  },

  // ─────────── Content writes (Phase 3 — live) ───────────
  {
    name: 'content-create-news-category',
    description: 'Create a news category.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-update-news-category',
    description: 'Update a news category.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-delete-news-category',
    description: 'Delete a news category (fails if articles reference it). Requires confirm:true.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'content-create-news',
    description: 'Create a news article or event (default status=DRAFT).',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-update-news',
    description: 'Update a news article / event (partial update).',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-publish-news',
    description: 'Transition a news article between DRAFT / PUBLISHED / ARCHIVED. Requires content:publish + confirm:true.',
    requiredScopes: ['content:publish'],
    group: 'content',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'content-delete-news',
    description: 'Delete a news article. Requires confirm:true.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'content-create-resource-category',
    description: 'Create a resource category (top-level or subcategory; max depth = 2 enforced).',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-update-resource-category',
    description: 'Update a resource category (parentId moves validated for depth = 2).',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-delete-resource-category',
    description: 'Delete a resource category (fails if it has resources or subcategories). Requires confirm:true.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'content-create-resource',
    description: 'Create a draft resource. Status defaults to DRAFT — publish separately.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-update-resource',
    description: 'Update a resource (partial update).',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
  },
  {
    name: 'content-publish-resource',
    description: 'Transition a resource between DRAFT / PUBLISHED / ARCHIVED. Requires content:publish + confirm:true.',
    requiredScopes: ['content:publish'],
    group: 'content',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'content-delete-resource',
    description: 'Delete a resource. Requires confirm:true.',
    requiredScopes: ['content:write'],
    group: 'content',
    status: 'live',
    mutating: true,
    destructive: true,
  },

  // ─────────── Operations (Phase 3 — live) ───────────
  {
    name: 'cache-purge',
    description: 'Force ISR + CloudFront cache invalidation for a set of paths (and optional tags).',
    requiredScopes: ['cache:purge'],
    group: 'cache',
    status: 'live',
    mutating: true,
  },

  // ─────────── Banners writes (Phase 3b — live) ───────────
  {
    name: 'banner-campaigns-create',
    description: 'Create a banner campaign.',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
  },
  {
    name: 'banner-campaigns-update',
    description: 'Update a banner campaign.',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
  },
  {
    name: 'banner-campaigns-delete',
    description: 'Delete a banner campaign (child banners survive with campaignId=null). Requires confirm:true.',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'banners-create',
    description: 'Create a popup banner (default status=DRAFT — publish separately).',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
  },
  {
    name: 'banners-update',
    description: 'Update a banner (partial). Use banners-publish for status transitions.',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
  },
  {
    name: 'banners-publish',
    description: 'Transition a banner between DRAFT / PUBLISHED / ARCHIVED. Requires banners:publish + confirm:true.',
    requiredScopes: ['banners:publish'],
    group: 'banners',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'banners-delete',
    description: 'Delete a banner (cascade-deletes impressions/clicks/submissions). Requires confirm:true.',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'banners-duplicate',
    description: 'Clone a banner under a new slug (status reset to DRAFT, counters zeroed).',
    requiredScopes: ['banners:write'],
    group: 'banners',
    status: 'live',
    mutating: true,
  },

  // ─────────── CMS writes (Phase 3b — live) ───────────
  {
    name: 'cms-create-page',
    description: 'Create a CMS page (default status=draft).',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'cms-update-page',
    description: 'Update a CMS page (title / description / metadata / type). Use cms-publish-page for status transitions.',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'cms-publish-page',
    description: 'Transition a page between draft / published. Requires cms:publish + confirm:true.',
    requiredScopes: ['cms:publish'],
    group: 'cms',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'cms-delete-page',
    description: 'Delete a CMS page (cascade-deletes PageSection rows). Requires confirm:true.',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'cms-reorder-page-sections',
    description: 'Reorder PageSection rows for a page (full list of ids in desired order).',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'cms-create-shared-section',
    description: 'Create a reusable shared section.',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'cms-update-shared-section',
    description: 'Update a shared section (changes propagate to every page that references it).',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'cms-delete-shared-section',
    description: 'Delete a shared section. Section.sharedSectionId → null (SetNull). Requires confirm:true.',
    requiredScopes: ['cms:write'],
    group: 'cms',
    status: 'live',
    mutating: true,
    destructive: true,
  },

  // ─────────── Forms writes (Phase 3b — live, SSRF-guarded) ───────────
  {
    name: 'forms-create',
    description: 'Create a form definition (webhookUrl is SSRF-validated: https only, no private IPs).',
    requiredScopes: ['forms:write'],
    group: 'forms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'forms-update',
    description: 'Update a form (partial). webhookUrl is re-validated on every change.',
    requiredScopes: ['forms:write'],
    group: 'forms',
    status: 'live',
    mutating: true,
  },
  {
    name: 'forms-delete',
    description: 'Delete a form (fails if any submissions or resources reference it). Requires confirm:true.',
    requiredScopes: ['forms:write'],
    group: 'forms',
    status: 'live',
    mutating: true,
    destructive: true,
  },

  // ─────────── Media writes (Phase 3b — live) ───────────
  {
    name: 'media-presign-upload',
    description: 'Step 1 of upload: issue presigned S3 PUT URL. Path-traversal protected.',
    requiredScopes: ['media:write'],
    group: 'media',
    status: 'live',
    mutating: true,
  },
  {
    name: 'media-attach-metadata',
    description: 'Step 2 of upload: upsert MediaAsset row after client PUTs the file.',
    requiredScopes: ['media:write'],
    group: 'media',
    status: 'live',
    mutating: true,
  },
  {
    name: 'media-update-asset-metadata',
    description: 'Patch MediaAsset metadata (altText / tags / folder / isPublic) without re-uploading.',
    requiredScopes: ['media:write'],
    group: 'media',
    status: 'live',
    mutating: true,
  },
  {
    name: 'media-delete-file',
    description: 'Delete a file from S3 + remove its MediaAsset row. Requires media:delete + confirm:true.',
    requiredScopes: ['media:delete'],
    group: 'media',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'media-create-folder',
    description: 'Create an empty S3 folder (places a .keep marker).',
    requiredScopes: ['media:write'],
    group: 'media',
    status: 'live',
    mutating: true,
  },
  {
    name: 'media-delete-folder',
    description: 'Delete an S3 folder and all objects inside. Requires media:delete + confirm:true.',
    requiredScopes: ['media:delete'],
    group: 'media',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'media-rename-folder',
    description: 'Rename / move an S3 folder. Updates MediaAsset.s3Path rows under the prefix.',
    requiredScopes: ['media:write'],
    group: 'media',
    status: 'live',
    mutating: true,
  },

  // ─────────── Users writes (Phase 3b — live, admin:* gated) ───────────
  {
    name: 'users-create',
    description: 'Create an admin user. Requires users:write AND admin:* AND confirm:true.',
    requiredScopes: ['users:write'],
    group: 'users',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'users-update',
    description: 'Update a user (refuses to demote the last active ADMIN). Requires admin:*. Password change requires confirm:true.',
    requiredScopes: ['users:write'],
    group: 'users',
    status: 'live',
    mutating: true,
  },
  {
    name: 'users-delete',
    description: 'Delete a user (refuses to delete the last active ADMIN). Requires admin:* + confirm:true.',
    requiredScopes: ['users:write'],
    group: 'users',
    status: 'live',
    mutating: true,
    destructive: true,
  },

  // ─────────── Admin writes (Phase 3b — live) ───────────
  {
    name: 'settings-update',
    description: 'Update SiteSettings (and/or MCP server settings). Requires settings:write AND admin:* AND confirm:true.',
    requiredScopes: ['settings:write'],
    group: 'settings',
    status: 'live',
    mutating: true,
    destructive: true,
  },
  {
    name: 'submissions-export-csv',
    description: 'Export form OR banner submissions as CSV (PII: email / IP). Choose kind="form" or "banner".',
    requiredScopes: ['submissions:export'],
    group: 'submissions',
    status: 'live',
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
