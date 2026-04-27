'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BannerSubmissionsTable from '@/components/admin/BannerSubmissionsTable';

export default function BannerSubmissionsPerBannerPage() {
  const params = useParams();
  const id = params?.id as string;
  const [banner, setBanner] = useState<{ name: string; slug: string; type: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/banners/${id}`)
      .then((r) => r.json())
      .then((d) => setBanner(d));
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/admin/banners/${id}/edit`} className="text-sure-blue-600 hover:underline text-sm">← Back to banner</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{banner?.name || 'Banner'} — Submissions</h1>
      <p className="text-sm text-gray-500 mb-6 font-mono">{banner?.slug}</p>
      {banner?.type === 'CTA' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          This is a CTA banner — it does not collect lead submissions. Switch type to LEAD_CAPTURE to enable email collection.
        </div>
      ) : (
        <BannerSubmissionsTable bannerId={id} showBannerColumn={false} />
      )}
    </div>
  );
}
