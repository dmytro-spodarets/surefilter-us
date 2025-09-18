'use client';

import { useState, useEffect } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SystemInfo {
  timestamp: string;
  version: string;
  environment: string;
  database: {
    status: string;
    error?: string;
  };
  uptime: string;
  memory: {
    used: string;
    total: string;
  };
}

interface HealthData {
  timestamp: string;
  database: { status: string; error: string | null };
  duplicates: { count: number; items: any[] };
  orphaned: { count: number; items: any[] };
  criticalPages: { missing: string[]; status: string };
  filterTypes: { withoutPageSlug: number; total: number };
}

interface FixResults {
  timestamp: string;
  orphanedFixed: number;
  duplicatesRemoved: number;
  errors: string[];
}

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'debug'>('overview');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState<FixResults | null>(null);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugDataPost, setDebugDataPost] = useState<DebugData | null>(null);
  const [debugLoadingPost, setDebugLoadingPost] = useState(false);

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/system-info');
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/health-check');
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const fixIssues = async () => {
    setFixing(true);
    try {
      const response = await fetch('/api/admin/fix-issues', {
        method: 'POST'
      });
      const data = await response.json();
      setFixResults(data);
      // Refresh health data after fixing
      await fetchHealthData();
    } catch (error) {
      console.error('Failed to fix issues:', error);
    } finally {
      setFixing(false);
    }
  };

  const cleanupOrphanedFilterTypes = async () => {
    if (!confirm('Delete all filter types with no linked pages? This cannot be undone.')) return;
    setFixing(true);
    try {
      const response = await fetch('/api/admin/filter-types/cleanup', { method: 'POST' });
      const result = await response.json();
      if (result.ok) {
        alert(`Successfully cleaned up orphaned filter types: ${result.message}`);
        // Refresh health data after cleanup
        await fetchHealthData();
      } else {
        alert(`Failed to cleanup: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cleaning up orphaned filter types:', error);
      alert('Failed to cleanup orphaned filter types');
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    if (activeTab === 'health') {
      fetchHealthData();
    }
    if (activeTab === 'debug') {
      fetchDebugData();
    }
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'ok':
        return 'text-green-600';
      case 'error':
      case 'missing':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'ok':
        return '✅';
      case 'error':
      case 'missing':
        return '❌';
      default:
        return '⚠️';
    }
  };

  return (
    <AdminContainer>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'primary' : 'outline'}
            >
              Overview
            </Button>
            <Button
              onClick={() => setActiveTab('health')}
              variant={activeTab === 'health' ? 'primary' : 'outline'}
            >
              System Health
            </Button>
            <Button
              onClick={() => setActiveTab('debug')}
              variant={activeTab === 'debug' ? 'primary' : 'outline'}
            >
              Debug
            </Button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Information</h3>
              {systemInfo ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono text-sm">{systemInfo.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-mono text-sm">{systemInfo.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-mono text-sm">{systemInfo.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-mono text-sm">
                      {systemInfo.memory.used} / {systemInfo.memory.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <div className="flex items-center gap-2">
                      <span className={getStatusColor(systemInfo.database.status)}>
                        {getStatusIcon(systemInfo.database.status)}
                      </span>
                      <span className={getStatusColor(systemInfo.database.status)}>
                        {systemInfo.database.status}
                      </span>
                    </div>
                  </div>
                  {systemInfo.database.error && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                      {systemInfo.database.error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Loading system information...</div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setActiveTab('health')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🔍 System Health Check
                </Button>
                <Button
                  onClick={() => window.open('/admin/filter-types', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🔧 Manage Filter Types
                </Button>
                <Button
                  onClick={() => window.open('/admin/pages', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  📄 Manage Pages
                </Button>
                <Button
                  onClick={() => window.open('/admin/products', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🛍️ Manage Products
                </Button>
              </div>
            </Card>

            {/* Database Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Database Management</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Database operations and maintenance tools:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Health monitoring</li>
                    <li>Duplicate detection</li>
                    <li>Orphaned references cleanup</li>
                    <li>Data integrity checks</li>
                  </ul>
                </div>
                <Button
                  onClick={() => setActiveTab('health')}
                  variant="primary"
                  className="w-full"
                >
                  Open Database Tools
                </Button>
              </div>
            </Card>

            {/* Application Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Application Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Functionality
                  </label>
                  <div className="text-sm text-gray-600">
                    Currently disabled for Phase 1 release
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    To enable: uncomment search components and remove TODO comments
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CloudFront Configuration
                  </label>
                  <div className="text-sm text-gray-600">
                    Origin enforcement: {process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Layout
                  </label>
                  <div className="text-sm text-gray-600">
                    Wide layout enabled for large monitors
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Server Actions / Proxy Debug</h2>
              <div className="flex gap-3">
                <Button onClick={fetchDebugData} disabled={debugLoading} variant="outline">
                  {debugLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button onClick={fetchDebugDataPost} disabled={debugLoadingPost} variant="outline">
                  {debugLoadingPost ? 'POST…' : 'POST snapshot'}
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Headers</h3>
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
            </Card>

            {/* Safe Headers (raw) */}
            <Card className="p-6">
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
            </Card>

            {/* Cookies */}
            <Card className="p-6">
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
            </Card>

            <Card className="p-6">
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
            </Card>

            <Card className="p-6">
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
            </Card>

            {/* POST Snapshot */}
            <Card className="p-6">
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
                <div className="text-gray-500">{debugLoadingPost ? 'Posting…' : 'Press “POST snapshot” to capture a POST request context.'}</div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
              <div className="flex gap-3">
                <Button
                  onClick={fetchHealthData}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button
                  onClick={fixIssues}
                  disabled={fixing || !healthData}
                  variant="primary"
                >
                  {fixing ? 'Fixing...' : 'Fix Issues'}
                </Button>
                <Button
                  onClick={cleanupOrphanedFilterTypes}
                  disabled={fixing}
                  variant="outline"
                  className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                >
                  {fixing ? 'Cleaning...' : 'Cleanup Orphaned Filter Types'}
                </Button>
              </div>
            </div>

            {healthData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Status */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Database</h3>
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(healthData.database.status)}>
                      {getStatusIcon(healthData.database.status)}
                    </span>
                    <span className={getStatusColor(healthData.database.status)}>
                      {healthData.database.status}
                    </span>
                  </div>
                  {healthData.database.error && (
                    <p className="text-sm text-red-600 mt-2">
                      {healthData.database.error}
                    </p>
                  )}
                </Card>

                {/* Duplicates */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Duplicate Pages</h3>
                  <div className="flex items-center gap-2">
                    <span className={healthData.duplicates.count === 0 ? 'text-green-600' : 'text-red-600'}>
                      {healthData.duplicates.count === 0 ? '✅' : '❌'}
                    </span>
                    <span className={healthData.duplicates.count === 0 ? 'text-green-600' : 'text-red-600'}>
                      {healthData.duplicates.count} found
                    </span>
                  </div>
                  {healthData.duplicates.count > 0 && (
                    <div className="mt-3 space-y-1">
                      {healthData.duplicates.items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <strong>{item.title}:</strong> {item.pages.length} pages
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Orphaned FilterTypes */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Orphaned FilterTypes</h3>
                  <div className="flex items-center gap-2">
                    <span className={healthData.orphaned.count === 0 ? 'text-green-600' : 'text-red-600'}>
                      {healthData.orphaned.count === 0 ? '✅' : '❌'}
                    </span>
                    <span className={healthData.orphaned.count === 0 ? 'text-green-600' : 'text-red-600'}>
                      {healthData.orphaned.count} found
                    </span>
                  </div>
                  {healthData.orphaned.count > 0 && (
                    <div className="mt-3 space-y-1">
                      {healthData.orphaned.items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <strong>{item.name}:</strong> {item.pageSlug}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Critical Pages */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Critical Pages</h3>
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(healthData.criticalPages.status)}>
                      {getStatusIcon(healthData.criticalPages.status)}
                    </span>
                    <span className={getStatusColor(healthData.criticalPages.status)}>
                      {healthData.criticalPages.status}
                    </span>
                  </div>
                  {healthData.criticalPages.missing.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-red-600 mb-2">Missing pages:</p>
                      <div className="space-y-1">
                        {healthData.criticalPages.missing.map((page, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {page}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* FilterTypes Status */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">FilterTypes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{healthData.filterTypes.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Without pageSlug:</span>
                      <span className={healthData.filterTypes.withoutPageSlug === 0 ? 'text-green-600' : 'text-yellow-600'}>
                        {healthData.filterTypes.withoutPageSlug}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Last Updated */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Last Updated</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(healthData.timestamp).toLocaleString()}
                  </p>
                </Card>
              </div>
            )}

            {/* Fix Results */}
            {fixResults && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Fix Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Orphaned Fixed:</span>
                    <span className="text-green-600">{fixResults.orphanedFixed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicates Removed:</span>
                    <span className="text-green-600">{fixResults.duplicatesRemoved}</span>
                  </div>
                  {fixResults.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-red-600 mb-2">Errors:</p>
                      <div className="space-y-1">
                        {fixResults.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Recent Changes - only show on overview tab */}
        {activeTab === 'overview' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Changes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PageSlug Sync:</span>
                <span className="text-green-600">✅ Fixed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filter Types API:</span>
                <span className="text-green-600">✅ Updated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duplicate Cleanup:</span>
                <span className="text-green-600">✅ Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Layout:</span>
                <span className="text-green-600">✅ Improved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Search Disabled:</span>
                <span className="text-yellow-600">⚠️ Phase 1</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminContainer>
  );
}