import Link from 'next/link';
import BannerCampaignForm from '@/components/admin/BannerCampaignForm';

export const metadata = { robots: { index: false, follow: false } };

export default function NewCampaignPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/banner-campaigns" className="text-sure-blue-600 hover:underline text-sm">← Back to Campaigns</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Campaign</h1>
      <BannerCampaignForm />
    </div>
  );
}
