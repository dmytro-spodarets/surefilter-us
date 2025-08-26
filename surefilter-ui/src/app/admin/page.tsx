import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {session.user?.email}</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="font-medium text-gray-900">Products</h2>
            <p className="text-sm text-gray-600">Manage filters and catalog.</p>
          </div>
          <Link href="/admin/pages" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h2 className="font-medium text-gray-900">Pages</h2>
            <p className="text-sm text-gray-600">Edit site pages and sections.</p>
          </Link>
          <Link href="/admin/industries" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h2 className="font-medium text-gray-900">Industries</h2>
            <p className="text-sm text-gray-600">Create and manage industry pages.</p>
          </Link>
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="font-medium text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Users, roles, preferences.</p>
          </div>
        </div>

        <div className="mt-8">
          <form action="/api/auth/signout" method="post">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">Sign out</button>
          </form>
        </div>
        <div className="mt-4">
          <Link href="/">← Back to site</Link>
        </div>
      </div>
    </main>
  );
}


