import 'server-only';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter for App Runner (single-instance).
 * For multi-instance deployments, use Redis or similar.
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if the key has exceeded the rate limit.
   * Returns { allowed: true } or { allowed: false, retryAfterMs }.
   */
  check(key: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
    const now = Date.now();
    this.cleanup(now);

    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true };
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return { allowed: true };
    }

    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  /** Periodically clean up expired entries to prevent memory leaks */
  private cleanup(now: number) {
    if (this.store.size > 10000) {
      for (const [key, entry] of this.store) {
        if (now >= entry.resetAt) {
          this.store.delete(key);
        }
      }
    }
  }
}

/** Extract client IP from request headers */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Pre-configured rate limiters
export const formSubmitLimiter = new RateLimiter(10, 60 * 60 * 1000); // 10 per hour
export const passwordLimiter = new RateLimiter(5, 15 * 60 * 1000);   // 5 per 15 min
export const publicApiLimiter = new RateLimiter(100, 60 * 1000);      // 100 per minute
