'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TimeSeriesChart, BreakdownList, StatCard } from '@/components/admin/BannerStatsCharts';

interface BannerStats {
  banner: {
    id: string;
    name: string;
    slug: string;
    type: 'LEAD_CAPTURE' | 'CTA';
    impressionCount: number;
    clickCount: number;
    submissionCount: number;
  };
  totals: { impressions: number; clicks: number; submissions: number };
  timeseries: {
    impressions: Array<{ day: string; count: number }>;
    clicks: Array<{ day: string; count: number }>;
  };
  breakdown: {
    pages: Array<{ key: string; count: number }>;
    referers: Array<{ key: string; count: number }>;
  };
}

export default function BannerStatsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/banners/${id}/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!stats?.banner) return <div className="p-6 text-red-600">Banner not found</div>;

  const ctr = stats.totals.impressions > 0
    ? ((stats.totals.clicks / stats.totals.impressions) * 100).toFixed(2)
    : '0.00';

  const conv = stats.banner.type === 'LEAD_CAPTURE' && stats.totals.impressions > 0
    ? ((stats.totals.submissions / stats.totals.impressions) * 100).toFixed(2)
    : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/banners" className="text-sm text-sure-blue-600 hover:underline">← Back to Banners</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{stats.banner.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{stats.banner.slug} · {stats.banner.type}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/banners/${id}/edit`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Edit</Link>
          {stats.banner.type === 'LEAD_CAPTURE' && (
            <Link href={`/admin/banners/${id}/submissions`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Submissions ({stats.totals.submissions})</Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Impressions" value={stats.totals.impressions} hint="all-time" color="blue" />
        <StatCard label="Clicks" value={stats.totals.clicks} hint={`CTR ${ctr}%`} color="green" />
        {stats.banner.type === 'LEAD_CAPTURE' ? (
          <StatCard label="Leads" value={stats.totals.submissions} hint={conv ? `Conv ${conv}%` : undefined} color="purple" />
        ) : (
          <StatCard label="Type" value={0} hint="CTA banner" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TimeSeriesChart title="Impressions (last 30 days)" data={stats.timeseries.impressions} color="#1D2475" />
        <TimeSeriesChart title="Clicks (last 30 days)" data={stats.timeseries.clicks} color="#15803d" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownList title="Top pages (last 30d)" data={stats.breakdown.pages} />
        <BreakdownList title="Top referers (last 30d)" data={stats.breakdown.referers} />
      </div>
    </div>
  );
}
