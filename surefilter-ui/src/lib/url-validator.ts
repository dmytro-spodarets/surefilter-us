import 'server-only';

const ALLOWED_DOMAINS = [
  'surefilter.com',
  'www.surefilter.com',
  'assets.surefilter.us',
  'surefilter.us',
  'surefilter-static-prod.s3.amazonaws.com',
  'surefilter-static-prod.s3.us-east-1.amazonaws.com',
  'surefilter-files-prod.s3.amazonaws.com',
  'surefilter-files-prod.s3.us-east-1.amazonaws.com',
];

const PRIVATE_IP_RANGES = [
  /^127\./,                    // localhost
  /^10\./,                     // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,               // 192.168.0.0/16
  /^169\.254\./,               // link-local / AWS metadata
  /^0\./,                      // 0.0.0.0/8
  /^::1$/,                     // IPv6 localhost
  /^fc00:/i,                   // IPv6 private
  /^fe80:/i,                   // IPv6 link-local
];

/**
 * Validates a URL for safe server-side fetching (SSRF prevention).
 * Returns the validated URL string or null if blocked.
 */
export function validateFetchUrl(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  // Only allow https (and http in development for MinIO)
  if (parsed.protocol !== 'https:') {
    if (process.env.NODE_ENV === 'development' && parsed.protocol === 'http:' && parsed.hostname === 'localhost') {
      // Allow local MinIO in development
    } else {
      return null;
    }
  }

  // Block private/internal IPs (except localhost in development)
  const hostname = parsed.hostname.toLowerCase();
  const isDevLocalhost = process.env.NODE_ENV === 'development' && hostname === 'localhost';
  if (!isDevLocalhost && (hostname === 'localhost' || PRIVATE_IP_RANGES.some(r => r.test(hostname)))) {
    return null;
  }

  // Check against allowed domains (localhost allowed in dev for MinIO)
  const isAllowed = ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
    || (process.env.NODE_ENV === 'development' && hostname === 'localhost');
  if (!isAllowed) {
    return null;
  }

  return parsed.toString();
}
