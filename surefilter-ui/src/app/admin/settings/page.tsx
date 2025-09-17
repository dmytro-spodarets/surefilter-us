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

export default function SettingsPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return '✅';
      case 'error':
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
          <Button
            onClick={fetchSystemInfo}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

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
                onClick={() => window.open('/admin/system-health', '_blank')}
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
                onClick={() => window.open('/admin/system-health', '_blank')}
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

        {/* Recent Changes */}
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
      </div>
    </AdminContainer>
  );
}
