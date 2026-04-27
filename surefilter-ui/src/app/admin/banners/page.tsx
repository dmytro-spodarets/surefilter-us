'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BannerRow {
  id: string;
  name: string;
  slug: string;
  type: 'LEAD_CAPTURE' | 'CTA';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  layout: string;
  title: string;
  impressionCount: number;
  clickCount: number;
  submissionCount: number;
  publishedAt: string | null;
  expiresAt: string | null;
  campaign: { id: string; name: string } | null;
  updatedAt: string;
}

export default function BannersListPage() {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', status: 'all', search: '' });

  useEffect(() => { fetchBanners(); }, [filter]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type !== 'all') params.append('type', filter.type);
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      const res = await fetch(`/api/admin/banners?${params}`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete banner "${name}"? This will also delete all impressions, clicks, and submissions.`)) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchBanners();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || 'Failed to delete');
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/admin/banners/${id}/duplicate`, { method: 'POST' });
    if (res.ok) {
      const dup = await res.json();
      window.location.href = `/admin/banners/${dup.id}/edit`;
    } else {
      alert('Failed to duplicate');
    }
  };

  const statusBadge = (status: BannerRow['status']) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-yellow-100 text-yellow-800',
    } as const;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const typeBadge = (type: BannerRow['type']) => {
    const styles = {
      LEAD_CAPTURE: 'bg-purple-100 text-purple-800',
      CTA: 'bg-blue-100 text-blue-800',
    } as const;
    const labels = { LEAD_CAPTURE: 'Lead', CTA: 'CTA' } as const;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>{labels[type]}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <Link href="/admin/banners/new" className="px-4 py-2 bg-sure-blue-600 text-white rounded-lg font-medium">
          + New Banner
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, title, slug…"
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="flex-1 min-w-[240px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filter.type}
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="CTA">CTA</option>
          <option value="LEAD_CAPTURE">Lead Capture</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 mb-3">No banners yet.</p>
          <Link href="/admin/banners/new" className="text-sure-blue-600 hover:underline">Create your first banner</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Layout</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Imp.</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Clicks</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Leads</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Updated</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/banners/${b.id}/edit`} className="font-medium text-gray-900 hover:text-sure-blue-600">
                      {b.name}
                    </Link>
                    <div className="text-xs text-gray-500 font-mono">{b.slug}</div>
                  </td>
                  <td className="px-4 py-3">{typeBadge(b.type)}</td>
                  <td className="px-4 py-3">{statusBadge(b.status)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{b.layout}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.impressionCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.clickCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.submissionCount}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(b.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <Link href={`/admin/banners/${b.id}/stats`} className="text-sure-blue-600 hover:underline mr-3">Stats</Link>
                    <Link href={`/admin/banners/${b.id}/edit`} className="text-sure-blue-600 hover:underline mr-3">Edit</Link>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(b.id)}
                      className="text-gray-600 hover:underline mr-3"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.name)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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
