/**
 * MCP scope vocabulary. Used both at runtime (token validation) and in admin UI
 * (token creation, Scopes Reference page).
 *
 * Scope key format: `<domain>:<action>` where action ∈
 *   { read, write, delete, publish, export, * }
 *
 * Wildcards:
 *   `<domain>:*`  — all actions within a single domain
 *   `admin:*`     — all scopes (super-wildcard, internal trusted tokens only)
 */

export type ScopeRisk = 'low' | 'medium' | 'high' | 'critical';
export type ScopeGroup =
  | 'public'
  | 'catalog'
  | 'content'
  | 'cms'
  | 'forms'
  | 'submissions'
  | 'banners'
  | 'media'
  | 'settings'
  | 'users'
  | 'cache'
  | 'analytics'
  | 'admin';

export type ScopeDefinition = {
  key: string;
  label: string;
  description: string;
  group: ScopeGroup;
  risk: ScopeRisk;
  /** True when this scope is implied by default (no token required). */
  public?: boolean;
};

export const SCOPES: ScopeDefinition[] = [
  // Public (no token required)
  {
    key: 'public:catalog',
    label: 'Public catalog read',
    description: 'Read published products, brands, categories, filter types, specs, media URLs.',
    group: 'public',
    risk: 'low',
    public: true,
  },
  {
    key: 'public:content',
    label: 'Public content read',
    description: 'Read published news articles, resources, their categories.',
    group: 'public',
    risk: 'low',
    public: true,
  },
  {
    key: 'public:cms',
    label: 'Public CMS read',
    description: 'Read published pages, sections, and the public part of SiteSettings (logo, nav, SEO meta).',
    group: 'public',
    risk: 'low',
    public: true,
  },

  // Catalog
  {
    key: 'catalog:read',
    label: 'Catalog read',
    description: 'Read all products (including drafts), brands, categories, filter types, specs, cross-references, media metadata.',
    group: 'catalog',
    risk: 'low',
  },
  {
    key: 'catalog:write',
    label: 'Catalog write',
    description: 'Create/update/delete products, brands, categories, filter types, specs, cross-references.',
    group: 'catalog',
    risk: 'high',
  },

  // Content (News + Resources)
  {
    key: 'content:read',
    label: 'Content read',
    description: 'Read all news articles + resources (including drafts), their categories.',
    group: 'content',
    risk: 'low',
  },
  {
    key: 'content:write',
    label: 'Content write',
    description: 'Create/update/delete news articles + resources + categories (drafts).',
    group: 'content',
    risk: 'medium',
  },
  {
    key: 'content:publish',
    label: 'Content publish',
    description: 'Publish or archive news articles + resources. Separate from content:write to allow editor/publisher split.',
    group: 'content',
    risk: 'high',
  },

  // CMS (Pages + Sections + SiteSettings sections)
  {
    key: 'cms:read',
    label: 'CMS read',
    description: 'Read pages (including drafts), sections, shared sections.',
    group: 'cms',
    risk: 'low',
  },
  {
    key: 'cms:write',
    label: 'CMS write',
    description: 'Create/update/delete pages, sections, shared sections, reorder. High risk — can change homepage.',
    group: 'cms',
    risk: 'high',
  },
  {
    key: 'cms:publish',
    label: 'CMS publish',
    description: 'Publish or unpublish pages. Always elicits confirmation.',
    group: 'cms',
    risk: 'critical',
  },

  // Forms
  {
    key: 'forms:read',
    label: 'Forms read',
    description: 'Read form definitions.',
    group: 'forms',
    risk: 'low',
  },
  {
    key: 'forms:write',
    label: 'Forms write',
    description: 'Create/update/delete form definitions. HIGH RISK — webhookUrl can be an exfiltration vector (SSRF-validated server-side).',
    group: 'forms',
    risk: 'high',
  },

  // Submissions
  {
    key: 'submissions:read',
    label: 'Submissions read',
    description: 'Read form submissions and banner lead submissions.',
    group: 'submissions',
    risk: 'medium',
  },
  {
    key: 'submissions:export',
    label: 'Submissions export',
    description: 'Export submissions as CSV (contains PII: email, IP). Separate scope for compliance.',
    group: 'submissions',
    risk: 'high',
  },

  // Banners
  {
    key: 'banners:read',
    label: 'Banners read',
    description: 'Read banners, campaigns, stats.',
    group: 'banners',
    risk: 'low',
  },
  {
    key: 'banners:write',
    label: 'Banners write',
    description: 'Create/update/delete banners + campaigns (drafts).',
    group: 'banners',
    risk: 'medium',
  },
  {
    key: 'banners:publish',
    label: 'Banners publish',
    description: 'Publish, schedule, pause, or archive banners.',
    group: 'banners',
    risk: 'high',
  },

  // Media
  {
    key: 'media:read',
    label: 'Media read',
    description: 'List files and folders in S3 media library.',
    group: 'media',
    risk: 'low',
  },
  {
    key: 'media:write',
    label: 'Media write',
    description: 'Upload files (presigned URL flow), rename folders, update asset metadata.',
    group: 'media',
    risk: 'medium',
  },
  {
    key: 'media:delete',
    label: 'Media delete',
    description: 'Delete files/folders from S3. Always elicits confirmation.',
    group: 'media',
    risk: 'high',
  },

  // SiteSettings
  {
    key: 'settings:read',
    label: 'Settings read',
    description: 'Read SiteSettings (header/footer, analytics, SEO defaults, redirects, MCP settings).',
    group: 'settings',
    risk: 'low',
  },
  {
    key: 'settings:write',
    label: 'Settings write',
    description: 'CRITICAL — modify SiteSettings: GA/GTM IDs, redirects, header/footer, default SEO meta, MCP server settings. Always elicits confirmation.',
    group: 'settings',
    risk: 'critical',
  },

  // Users
  {
    key: 'users:read',
    label: 'Users read',
    description: 'List admin users (emails partially masked unless paired with admin:*).',
    group: 'users',
    risk: 'medium',
  },
  {
    key: 'users:write',
    label: 'Users write',
    description: 'CRITICAL — create/update/delete admin users. Only granted via admin:*. Always elicits confirmation.',
    group: 'users',
    risk: 'critical',
  },

  // Operations
  {
    key: 'cache:purge',
    label: 'Cache purge',
    description: 'Force ISR + CloudFront cache invalidation for specific paths or wildcard.',
    group: 'cache',
    risk: 'medium',
  },
  {
    key: 'analytics:read',
    label: 'Analytics read',
    description: 'Read AdminLog, banner stats, form submission counts, MCP usage metrics.',
    group: 'analytics',
    risk: 'low',
  },

  // Super-wildcard
  {
    key: 'admin:*',
    label: 'Full admin (wildcard)',
    description:
      'Grants every scope listed above, including users:* and settings:*. Use only for trusted internal automation. UI requires explicit confirmation.',
    group: 'admin',
    risk: 'critical',
  },
];

export const SCOPE_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  scopes: string[];
  risk: ScopeRisk;
}> = [
  {
    id: 'read-only-researcher',
    label: 'Read-only researcher',
    description: 'Read access to catalog, content, CMS and analytics. Safe for AI research workflows.',
    scopes: ['catalog:read', 'content:read', 'cms:read', 'analytics:read'],
    risk: 'low',
  },
  {
    id: 'content-editor',
    label: 'Content editor',
    description: 'Read everything safe + manage news/resources/media (drafts + publish).',
    scopes: [
      'catalog:read',
      'cms:read',
      'analytics:read',
      'content:read',
      'content:write',
      'content:publish',
      'media:read',
      'media:write',
    ],
    risk: 'medium',
  },
  {
    id: 'catalog-admin',
    label: 'Catalog admin',
    description: 'Full control over product catalog and media.',
    scopes: ['catalog:read', 'catalog:write', 'media:read', 'media:write', 'media:delete'],
    risk: 'high',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Banners + campaigns + submissions + analytics.',
    scopes: [
      'banners:read',
      'banners:write',
      'banners:publish',
      'submissions:read',
      'submissions:export',
      'analytics:read',
    ],
    risk: 'medium',
  },
  {
    id: 'full-admin',
    label: 'Full admin (admin:*)',
    description:
      'Wildcard granting every scope including users + settings. Use only for trusted internal automation.',
    scopes: ['admin:*'],
    risk: 'critical',
  },
];

export const ALL_SCOPE_KEYS: string[] = SCOPES.map((s) => s.key);

/** All non-wildcard concrete scopes, grouped by domain. Useful for UI. */
export function groupScopes(): Record<ScopeGroup, ScopeDefinition[]> {
  const out = {} as Record<ScopeGroup, ScopeDefinition[]>;
  for (const s of SCOPES) {
    (out[s.group] ??= []).push(s);
  }
  return out;
}

/** Compact label for a list of scopes — collapses domain:* and admin:* wildcards. */
export function summarizeScopes(scopes: string[]): string {
  if (scopes.includes('admin:*')) return 'admin:*';
  return scopes.join(', ');
}

/**
 * Validate that every scope in the provided list is recognized.
 * Returns the list of unknown scopes (empty if all valid).
 */
export function validateScopes(scopes: string[]): string[] {
  const known = new Set(ALL_SCOPE_KEYS);
  return scopes.filter((s) => !known.has(s));
}
