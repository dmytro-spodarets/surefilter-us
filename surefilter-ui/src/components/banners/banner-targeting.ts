import type { PublicBanner, UtmRule, RefererRule } from '@/types/banners';

/** Normalise a pathname into a slug-ish form. "/" stays "/". "/foo/bar" → "foo/bar". */
export function pathnameToSlug(pathname: string): string {
  if (pathname === '/' || pathname === '') return '/';
  return pathname.replace(/^\/+/, '').replace(/\/+$/, '');
}

/** Check if a slug matches a pattern. Supports wildcards: "products/*" matches "products/anything". */
function slugMatchesPattern(pattern: string, slug: string): boolean {
  if (pattern === slug) return true;
  if (!pattern.includes('*')) return false;
  // Convert glob to regex: escape special chars, then * → [^/]*
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  return new RegExp(`^${escaped}$`).test(slug);
}

function matchesAnyPattern(patterns: string[], slug: string, pathname: string): boolean {
  return patterns.some((p) => slugMatchesPattern(p, slug) || slugMatchesPattern(p, pathname));
}

export function matchesPath(banner: PublicBanner, pathname: string): boolean {
  const slug = pathnameToSlug(pathname);
  if (matchesAnyPattern(banner.excludeSlugs, slug, pathname)) return false;
  if (banner.targetAllPages) return true;
  return matchesAnyPattern(banner.targetSlugs, slug, pathname);
}

function checkOp(haystack: string, op: 'equals' | 'contains' | 'startsWith', needle: string): boolean {
  switch (op) {
    case 'equals': return haystack === needle;
    case 'contains': return haystack.includes(needle);
    case 'startsWith': return haystack.startsWith(needle);
  }
}

export function matchesUtm(rules: UtmRule[] | null | undefined, params: URLSearchParams): boolean {
  if (!rules || rules.length === 0) return true;
  return rules.every((r) => {
    const val = params.get(r.key) || '';
    return checkOp(val, r.op, r.value);
  });
}

export function matchesReferer(rules: RefererRule[] | null | undefined, referer: string): boolean {
  if (!rules || rules.length === 0) return true;
  return rules.some((r) => checkOp(referer, r.op, r.value));
}
