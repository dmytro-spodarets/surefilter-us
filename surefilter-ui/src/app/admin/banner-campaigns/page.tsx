'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CampaignRow {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  description: string | null;
  notifyEmail: string | null;
  _count: { banners: number };
  updatedAt: string;
}

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', search: '' });

  useEffect(() => { fetchCampaigns(); }, [filter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      const res = await fetch(`/api/admin/banner-campaigns?${params}`);
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}"? Banners stay but lose campaign association.`)) return;
    const res = await fetch(`/api/admin/banner-campaigns/${id}`, { method: 'DELETE' });
    if (res.ok) fetchCampaigns();
    else alert('Failed to delete');
  };

  const statusBadge = (status: CampaignRow['status']) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-gray-100 text-gray-700',
    } as const;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Campaigns</h1>
        <Link href="/admin/banner-campaigns/new" className="px-4 py-2 bg-sure-blue-600 text-white rounded-lg font-medium">
          + New Campaign
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search…"
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="flex-1 min-w-[240px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 mb-3">No campaigns yet.</p>
          <Link href="/admin/banner-campaigns/new" className="text-sure-blue-600 hover:underline">Create your first campaign</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Banners</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Updated</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/banner-campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-sure-blue-600">
                      {c.name}
                    </Link>
                    <div className="text-xs text-gray-500 font-mono">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c._count.banners}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <Link href={`/admin/banner-campaigns/${c.id}`} className="text-sure-blue-600 hover:underline mr-3">Stats</Link>
                    <Link href={`/admin/banner-campaigns/${c.id}/edit`} className="text-sure-blue-600 hover:underline mr-3">Edit</Link>
                    <button type="button" onClick={() => handleDelete(c.id, c.name)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
