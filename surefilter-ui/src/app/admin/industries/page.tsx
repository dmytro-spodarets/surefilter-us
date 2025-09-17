import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import NewPageForm from '../pages/NewPageForm';
import { authOptions } from '@/lib/auth';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function IndustriesPagesList() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/industries');

  const pages = await prisma.page.findMany({
    where: { type: 'INDUSTRY' },
    orderBy: { slug: 'asc' },
  });

  return (
    <AdminContainer>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Industries</h1>
          <div className="flex items-center gap-4">
            <NewPageForm presetType="INDUSTRY" presetPrefix="industries/" buttonLabel="New industry page" />
            <div className="text-sm">
              <Link href="/admin" className="text-sure-blue-600 hover:underline">← Back to dashboard</Link>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div>
            <div className="font-medium text-gray-900">Industries — landing page</div>
            <div className="text-sm text-gray-600">/industries</div>
          </div>
          <Link href="/admin/pages/industries" className="text-sure-blue-600 hover:underline">Edit</Link>
        </div>
        <ul className="mt-6 divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {pages.map((p) => (
            <li key={p.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{p.title}</div>
                <div className="text-sm text-gray-600">/{p.slug}</div>
              </div>
              <Link href={`/admin/pages/${p.slug}`} className="text-sure-blue-600 hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
    </AdminContainer>
  );
}


