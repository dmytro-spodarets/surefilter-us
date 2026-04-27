import Link from 'next/link';
import BannerSubmissionsTable from '@/components/admin/BannerSubmissionsTable';

export const metadata = { robots: { index: false, follow: false } };

export default function BannerSubmissionsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Submissions</h1>
        <Link href="/admin/banners" className="text-sm text-sure-blue-600 hover:underline">← Back to Banners</Link>
      </div>
      <BannerSubmissionsTable showBannerColumn />
    </div>
  );
}
