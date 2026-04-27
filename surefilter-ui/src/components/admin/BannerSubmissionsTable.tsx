'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  email: string;
  pageUrl: string | null;
  utmParams: Record<string, string> | null;
  referer: string | null;
  ipAddress: string | null;
  emailSent: boolean;
  emailError: string | null;
  createdAt: string;
  banner: { id: string; name: string; slug: string };
}

interface BannerSubmissionsTableProps {
  bannerId?: string;
  showBannerColumn?: boolean;
}

export default function BannerSubmissionsTable({ bannerId, showBannerColumn = true }: BannerSubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (bannerId) params.append('bannerId', bannerId);
    if (search) params.append('search', search);

    setLoading(true);
    fetch(`/api/admin/banner-submissions?${params}`)
      .then((r) => r.json())
      .then((d) => setSubmissions(Array.isArray(d?.submissions) ? d.submissions : []))
      .finally(() => setLoading(false));
  }, [bannerId, search]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete submission from ${email}?`)) return;
    const res = await fetch(`/api/admin/banner-submissions/${id}`, { method: 'DELETE' });
    if (res.ok) setSubmissions((s) => s.filter((x) => x.id !== id));
    else alert('Failed to delete');
  };

  const handleRetryEmail = async (id: string) => {
    setRetrying(id);
    try {
      const res = await fetch(`/api/admin/banner-submissions/${id}/retry-email`, { method: 'POST' });
      if (res.ok) {
        setSubmissions((subs) => subs.map((s) => (s.id === id ? { ...s, emailSent: true, emailError: null } : s)));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Retry failed');
      }
    } finally {
      setRetrying(null);
    }
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (bannerId) params.append('bannerId', bannerId);
    window.open(`/api/admin/banner-submissions/export?${params}`, '_blank');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg text-gray-500">
          No submissions yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                {showBannerColumn && <th className="px-4 py-3 text-left font-medium text-gray-700">Banner</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-700">Page</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">UTM</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Submitted</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.email}</td>
                  {showBannerColumn && (
                    <td className="px-4 py-3">
                      <Link href={`/admin/banners/${s.banner.id}/edit`} className="text-sure-blue-600 hover:underline">
                        {s.banner.name}
                      </Link>
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                    {s.pageUrl ? (
                      <a href={s.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {s.pageUrl}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {s.utmParams ? Object.entries(s.utmParams).map(([k, v]) => (
                      <div key={k}><span className="text-gray-400">{k}:</span> {v}</div>
                    )) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(s.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {s.emailSent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Sent</span>
                    ) : s.emailError ? (
                      <span title={s.emailError} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Failed</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">No notify</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    {!s.emailSent && (
                      <button
                        type="button"
                        disabled={retrying === s.id}
                        onClick={() => handleRetryEmail(s.id)}
                        className="text-sure-blue-600 hover:underline mr-3 disabled:opacity-60"
                      >
                        {retrying === s.id ? 'Retrying…' : 'Retry email'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.email)}
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
