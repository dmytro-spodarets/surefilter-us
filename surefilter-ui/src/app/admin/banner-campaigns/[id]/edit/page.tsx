'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BannerCampaignForm from '@/components/admin/BannerCampaignForm';

export default function EditCampaignPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/banner-campaigns/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/banner-campaigns" className="text-sure-blue-600 hover:underline text-sm">← Back to Campaigns</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Campaign</h1>
      {loading && <p className="text-gray-500">Loading…</p>}
      {data && <BannerCampaignForm campaignId={id} initialData={data} />}
    </div>
  );
}
