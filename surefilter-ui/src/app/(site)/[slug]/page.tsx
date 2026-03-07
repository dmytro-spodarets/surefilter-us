// kept for top-level single-segment pages; catch-all handles multi-segment
export { default, generateMetadata } from '../[...slug]/page';

// Must be a literal — Next.js statically analyzes AST, re-exports are not recognized
export const revalidate = 86400;

// Enable ISR for single-segment dynamic routes (e.g. /about-us, /contact-us).
// Without this, Next.js treats the route as fully dynamic with no caching.
export function generateStaticParams() {
  return [];
}
