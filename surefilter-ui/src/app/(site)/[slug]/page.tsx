// kept for top-level single-segment pages; catch-all handles multi-segment
export { default, generateMetadata, revalidate } from '../[...slug]/page';

// Enable ISR for single-segment dynamic routes (e.g. /about-us, /contact-us).
// Without this, Next.js treats the route as fully dynamic with no caching.
export function generateStaticParams() {
  return [];
}
