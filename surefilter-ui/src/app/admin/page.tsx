import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  return (
    <AdminContainer>
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome, {session.user?.email}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/products" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h2 className="font-medium text-gray-900">Products</h2>
          <p className="text-sm text-gray-600">Manage filters and catalog.</p>
        </Link>
        <Link href="/admin/pages" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h2 className="font-medium text-gray-900">Pages</h2>
          <p className="text-sm text-gray-600">Edit site pages and sections.</p>
        </Link>
        <Link href="/admin/industries" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h2 className="font-medium text-gray-900">Industries</h2>
          <p className="text-sm text-gray-600">Create and manage industry pages.</p>
        </Link>
        <Link href="/admin/settings" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h2 className="font-medium text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600">Site settings, pages, navigation, footer.</p>
        </Link>
      </div>

      <div className="mt-8">
        <form action="/api/auth/signout" method="post">
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">Sign out</button>
        </form>
      </div>
      <div className="mt-4">
        <Link href="/">← Back to site</Link>
      </div>
    </AdminContainer>
  );
}


