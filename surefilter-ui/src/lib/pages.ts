export const RESERVED_SLUGS = new Set<string>([
  'admin',
  'api',
  'login',
  'logout',
  'health',
  // Core site pages managed in code
  'home',
  'about-us',
  'contact-us',
  'catalog',
  'filters',
  'industries',
  'resources',
  'warranty',
  'newsroom',
  'heavy-duty',
  'automotive',
  'test-colors',
  '',
]);

export function isProtectedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function isValidNewSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && !RESERVED_SLUGS.has(slug);
}


