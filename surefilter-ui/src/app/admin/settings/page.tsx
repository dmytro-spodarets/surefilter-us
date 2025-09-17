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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'health'>('overview');
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
    if (activeTab === 'health') {
      fetchHealthData();
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