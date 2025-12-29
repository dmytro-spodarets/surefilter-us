export const RESERVED_SLUGS = new Set<string>([
  // System routes
  'admin',
  'api',
  'login',
  'logout',
  'health',
  // Special pages
  'home', // Main page (/)
  // Functional pages with custom logic
  'newsroom', // News & Events with DB queries
  'resources', // Resources with DB queries
  // Multi-segment prefixes
  'industries', // For /industries/*
  'heavy-duty', // For /heavy-duty/*
  'automotive', // For /automotive/*
  '',
]);

export function isProtectedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function isValidNewSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && !RESERVED_SLUGS.has(slug);
}


