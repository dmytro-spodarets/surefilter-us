import Link from 'next/link';
import BannerForm from '@/components/admin/BannerForm';

export const metadata = { robots: { index: false, follow: false } };

export default function NewBannerPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/banners" className="text-sure-blue-600 hover:underline text-sm">← Back to Banners</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Banner</h1>
      <BannerForm />
    </div>
  );
}
