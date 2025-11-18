'use client';

import { useState, useEffect } from 'react';

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

export default function SystemHealthPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState<FixResults | null>(null);

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
    fetchHealthData();
  }, []);

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
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Information */}
          <div>
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
          </div>

          {/* Database Management */}
          <div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Health Check Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Database Health Check</h2>
          <div className="flex gap-3">
            <button
              onClick={fetchHealthData}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
            <button
              onClick={fixIssues}
              disabled={fixing || !healthData}
              className="px-4 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              {fixing ? 'Fixing...' : '🔧 Fix Issues'}
            </button>
            <button
              onClick={cleanupOrphanedFilterTypes}
              disabled={fixing}
              className="px-4 py-2 bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
            >
              {fixing ? 'Cleaning...' : '🗑️ Cleanup Orphaned Filter Types'}
            </button>
          </div>
        </div>

        {healthData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Database Status */}
            <div className="border border-gray-200 rounded-lg p-4">
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
            </div>

            {/* Duplicates */}
            <div className="border border-gray-200 rounded-lg p-4">
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
            </div>

            {/* Orphaned FilterTypes */}
            <div className="border border-gray-200 rounded-lg p-4">
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
            </div>

            {/* Critical Pages */}
            <div className="border border-gray-200 rounded-lg p-4">
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
            </div>

            {/* FilterTypes Status */}
            <div className="border border-gray-200 rounded-lg p-4">
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
            </div>

            {/* Last Updated */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Last Updated</h3>
              <p className="text-sm text-gray-600">
                {new Date(healthData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fix Results */}
      {fixResults && (
        <div className="bg-white shadow rounded-lg p-6">
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
        </div>
      )}
    </div>
  );
}

