'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TimeSeriesChart, StatCard } from '@/components/admin/BannerStatsCharts';

interface CampaignStats {
  campaign: { id: string; name: string; slug: string; status: string };
  totals: { impressions: number; clicks: number; submissions: number };
  banners: Array<{
    id: string;
    name: string;
    slug: string;
    type: 'LEAD_CAPTURE' | 'CTA';
    status: string;
    impressionCount: number;
    clickCount: number;
    submissionCount: number;
  }>;
  timeseries: {
    impressions: Array<{ day: string; count: number }>;
    clicks: Array<{ day: string; count: number }>;
  };
}

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/banner-campaigns/${id}/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!stats?.campaign) return <div className="p-6 text-red-600">Campaign not found</div>;

  const ctr = stats.totals.impressions > 0
    ? ((stats.totals.clicks / stats.totals.impressions) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/banner-campaigns" className="text-sm text-sure-blue-600 hover:underline">← Back to Campaigns</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{stats.campaign.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{stats.campaign.slug}</p>
        </div>
        <Link href={`/admin/banner-campaigns/${id}/edit`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
          Edit Campaign
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Impressions" value={stats.totals.impressions} color="blue" />
        <StatCard label="Clicks" value={stats.totals.clicks} hint={`CTR ${ctr}%`} color="green" />
        <StatCard label="Leads" value={stats.totals.submissions} color="purple" />
        <StatCard label="Banners" value={stats.banners.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TimeSeriesChart title="Impressions (last 30 days)" data={stats.timeseries.impressions} color="#1D2475" />
        <TimeSeriesChart title="Clicks (last 30 days)" data={stats.timeseries.clicks} color="#15803d" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900">Banners in this campaign</div>
        {stats.banners.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No banners yet. Assign banners to this campaign in their edit form.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Imp.</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Clicks</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Leads</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.banners.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{b.name}</td>
                  <td className="px-4 py-2 text-xs">{b.type}</td>
                  <td className="px-4 py-2 text-xs">{b.status}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{b.impressionCount}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{b.clickCount}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{b.submissionCount}</td>
                  <td className="px-4 py-2 text-right text-xs">
                    <Link href={`/admin/banners/${b.id}/stats`} className="text-sure-blue-600 hover:underline mr-3">Stats</Link>
                    <Link href={`/admin/banners/${b.id}/edit`} className="text-sure-blue-600 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
