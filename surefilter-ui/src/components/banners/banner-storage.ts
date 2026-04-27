import type { BannerDismissMode } from '@/types/banners';

const SESSION_PREFIX = 'sf_banner_session_';
const LOCAL_PREFIX = 'sf_banner_dismissed_';
const SESSION_ID_KEY = 'sf_banner_session_id';

function safeLocal<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export function getOrCreateSessionId(): string {
  return safeLocal(() => {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  }, 'anon');
}

export function isDismissed(bannerId: string, mode: BannerDismissMode, ttlDays: number | null | undefined): boolean {
  return safeLocal(() => {
    if (mode === 'SESSION') {
      return sessionStorage.getItem(SESSION_PREFIX + bannerId) === '1';
    }
    const raw = localStorage.getItem(LOCAL_PREFIX + bannerId);
    if (!raw) {
      // For SESSION+DAYS+FOREVER also check session — once-per-session is universally enforced
      return sessionStorage.getItem(SESSION_PREFIX + bannerId) === '1';
    }
    if (mode === 'FOREVER') return true;
    if (mode === 'DAYS' && ttlDays != null) {
      const ts = parseInt(raw, 10);
      if (Number.isNaN(ts)) return false;
      return Date.now() - ts < ttlDays * 24 * 60 * 60 * 1000;
    }
    return true;
  }, false);
}

export function markDismissed(bannerId: string, mode: BannerDismissMode): void {
  safeLocal(() => {
    sessionStorage.setItem(SESSION_PREFIX + bannerId, '1');
    if (mode === 'DAYS' || mode === 'FOREVER') {
      localStorage.setItem(LOCAL_PREFIX + bannerId, String(Date.now()));
    }
  }, undefined);
}
