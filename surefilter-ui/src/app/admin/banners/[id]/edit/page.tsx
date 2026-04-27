'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BannerForm from '@/components/admin/BannerForm';

export default function EditBannerPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/banners/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => setData(d))
      .catch(() => setError('Failed to load banner'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/banners" className="text-sure-blue-600 hover:underline text-sm">← Back to Banners</Link>
        <div className="flex gap-2">
          <Link href={`/admin/banners/${id}/stats`} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
            📊 Stats
          </Link>
          {data?.type === 'LEAD_CAPTURE' && (
            <Link href={`/admin/banners/${id}/submissions`} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
              📥 View Submissions ({data.submissionCount ?? 0})
            </Link>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Banner</h1>
      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && <BannerForm bannerId={id} initialData={data} />}
    </div>
  );
}
