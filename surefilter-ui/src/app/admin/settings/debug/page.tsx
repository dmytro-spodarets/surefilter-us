'use client';

import { useState, useEffect } from 'react';

interface DebugData {
  request: { url: string; method: string };
  headers: {
    host: string | null;
    'x-forwarded-host': string | null;
    'x-original-forwarded-host': string | null;
    'x-cf-fn'?: string | null;
    origin: string | null;
    referer: string | null;
    'x-forwarded-proto': string | null;
    'x-forwarded-port': string | null;
    'x-mw-normalized': string | null;
  };
  allSafeHeaders?: Record<string, string | boolean | null>;
  cookies?: { names: string[]; count: number };
  server: {
    NODE_ENV: string | null;
    NEXT_PUBLIC_SITE_URL: string | null;
    NEXTAUTH_URL: string | null;
    ENFORCE_ORIGIN: string | null;
    NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS: string | null;
  };
  derived: {
    effectiveAllowedOrigins: string[];
    originMismatch: boolean | null;
    isServerActionLike?: boolean;
    viaCloudFront?: boolean | null;
  };
  timestamp: string;
}

export default function DebugInfoPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugDataPost, setDebugDataPost] = useState<DebugData | null>(null);
  const [debugLoadingPost, setDebugLoadingPost] = useState(false);

  const fetchDebugData = async () => {
    setDebugLoading(true);
    try {
      const res = await fetch('/api/admin/debug', { cache: 'no-store' });
      const data = await res.json();
      setDebugData(data);
    } catch (e) {
      console.error('Failed to fetch debug info:', e);
    } finally {
      setDebugLoading(false);
    }
  };

  const fetchDebugDataPost = async () => {
    setDebugLoadingPost(true);
    try {
      const res = await fetch('/api/admin/debug', { method: 'POST', cache: 'no-store' });
      const data = await res.json();
      setDebugDataPost(data);
    } catch (e) {
      console.error('Failed to POST debug info:', e);
    } finally {
      setDebugLoadingPost(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Server Actions / Proxy Debug</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchDebugData}
            disabled={debugLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {debugLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            onClick={fetchDebugDataPost}
            disabled={debugLoadingPost}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {debugLoadingPost ? 'POST…' : '📮 POST snapshot'}
          </button>
        </div>
      </div>

      {/* Headers */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Headers (GET)</h3>
        {debugData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Host</span><span className="font-mono">{debugData.headers.host || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">x-forwarded-host</span><span className="font-mono">{debugData.headers['x-forwarded-host'] || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">x-original-forwarded-host</span><span className="font-mono">{debugData.headers['x-original-forwarded-host'] || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">x-cf-fn</span><span className="font-mono">{debugData.headers['x-cf-fn'] || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">x-mw-normalized</span><span className="font-mono">{debugData.headers['x-mw-normalized'] || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Origin</span><span className="font-mono">{debugData.headers.origin || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Referer</span><span className="font-mono">{debugData.headers.referer || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">x-forwarded-proto</span><span className="font-mono">{debugData.headers['x-forwarded-proto'] || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">x-forwarded-port</span><span className="font-mono">{debugData.headers['x-forwarded-port'] || '—'}</span></div>
          </div>
        ) : (
          <div className="text-gray-500">{debugLoading ? 'Loading…' : 'No data yet.'}</div>
        )}
      </div>

      {/* Safe Headers (raw) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Safe Headers (GET)</h3>
        {debugData?.allSafeHeaders ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {Object.entries(debugData.allSafeHeaders).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-gray-600 break-all">{k}</span>
                <span className="font-mono break-all">{String(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No data</div>
        )}
      </div>

      {/* Cookies */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Cookies</h3>
        {debugData?.cookies ? (
          <div className="text-sm">
            <div className="mb-2 text-gray-600">Count: {debugData.cookies.count}</div>
            <div className="flex flex-wrap gap-2">
              {debugData.cookies.names.map((name) => (
                <span key={name} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{name}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No cookies</div>
        )}
      </div>

      {/* Server Environment */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Server Environment</h3>
        {debugData ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">NODE_ENV</span><span className="font-mono">{debugData.server.NODE_ENV || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">NEXT_PUBLIC_SITE_URL</span><span className="font-mono">{debugData.server.NEXT_PUBLIC_SITE_URL || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">NEXTAUTH_URL</span><span className="font-mono">{debugData.server.NEXTAUTH_URL || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">ENFORCE_ORIGIN</span><span className="font-mono">{debugData.server.ENFORCE_ORIGIN || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS</span><span className="font-mono break-all">{debugData.server.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS || '—'}</span></div>
          </div>
        ) : (
          <div className="text-gray-500">{debugLoading ? 'Loading…' : 'No data yet.'}</div>
        )}
      </div>

      {/* Derived */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Derived</h3>
        {debugData ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Effective Allowed Origins</span><span className="font-mono break-all">{debugData.derived.effectiveAllowedOrigins.join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Origin Mismatch?</span><span className={debugData.derived.originMismatch ? 'text-red-600' : 'text-green-600'}>{String(debugData.derived.originMismatch)}</span></div>
            {'isServerActionLike' in debugData.derived && (
              <div className="flex justify-between"><span className="text-gray-600">Looks like Server Action?</span><span className="font-mono">{String(debugData.derived.isServerActionLike)}</span></div>
            )}
            {'viaCloudFront' in debugData.derived && (
              <div className="flex justify-between"><span className="text-gray-600">Via CloudFront?</span><span className="font-mono">{String(debugData.derived.viaCloudFront)}</span></div>
            )}
            <div className="text-xs text-gray-500">Timestamp: {new Date(debugData.timestamp).toLocaleString()}</div>
          </div>
        ) : (
          <div className="text-gray-500">{debugLoading ? 'Loading…' : 'No data yet.'}</div>
        )}
      </div>

      {/* POST Snapshot */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">POST Snapshot (simulate Server Action)</h3>
        {debugDataPost ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex justify-between"><span className="text-gray-600">Host</span><span className="font-mono">{debugDataPost.headers.host || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">x-forwarded-host</span><span className="font-mono">{debugDataPost.headers['x-forwarded-host'] || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Origin</span><span className="font-mono">{debugDataPost.headers.origin || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Content-Type</span><span className="font-mono">{debugDataPost.allSafeHeaders?.['content-type'] as string || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">next-action</span><span className="font-mono">{String(debugDataPost.allSafeHeaders?.['next-action'] ?? '—')}</span></div>
            </div>
            <div className="flex justify-between"><span className="text-gray-600">Looks like Server Action?</span><span className="font-mono">{String(debugDataPost.derived.isServerActionLike)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Via CloudFront?</span><span className="font-mono">{String(debugDataPost.derived.viaCloudFront)}</span></div>
            <div className="text-xs text-gray-500">Timestamp: {new Date(debugDataPost.timestamp).toLocaleString()}</div>
          </div>
        ) : (
          <div className="text-gray-500">{debugLoadingPost ? 'Posting…' : 'Press "POST snapshot" to capture a POST request context.'}</div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📘 What is this?</h4>
        <p className="text-sm text-blue-800">
          This debug page helps troubleshoot deployment issues, especially with CloudFront, proxies, and Next.js Server Actions. 
          It shows request headers, environment variables, and derived configuration to identify routing or authentication problems.
        </p>
      </div>
    </div>
  );
}

