'use client';

import { useState, useEffect } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState<FixResults | null>(null);

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

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
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
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
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
    </AdminContainer>
  );
}
