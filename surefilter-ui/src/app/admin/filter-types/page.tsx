import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = { robots: { index: false, follow: false } };

export default async function FilterTypesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/filter-types');

  const [hd, auto] = await Promise.all([
    prisma.filterType.findMany({ where: { category: 'HEAVY_DUTY' }, orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { name: 'asc' }] }),
    prisma.filterType.findMany({ where: { category: 'AUTOMOTIVE' }, orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { name: 'asc' }] }),
  ]);

  const Section = ({ title, items }: { title: string; items: any[] }) => (
    <section className="border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <Link href={`/admin/filter-types/new?category=${title === 'Heavy Duty' ? 'HEAVY_DUTY' : 'AUTOMOTIVE'}`} className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg">New type</Link>
      </div>
      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        {(items || []).map((it) => (
          <li key={it.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">{it.name}</div>
              <div className="text-sm text-gray-600">/{it.pageSlug || 'No page linked'}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/admin/pages/${it.pageSlug || it.fullSlug}`} className="text-sure-blue-600 hover:underline">Edit page content</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <AdminContainer className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Filter Types</h1>
          <Link href="/admin" className="text-sure-blue-600 hover:underline">← Back to dashboard</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div>
              <div className="font-medium text-gray-900">Heavy Duty — landing page</div>
              <div className="text-sm text-gray-600">/heavy-duty</div>
            </div>
            <Link href="/admin/pages/heavy-duty" className="text-sure-blue-600 hover:underline">Edit</Link>
          </div>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div>
              <div className="font-medium text-gray-900">Automotive — landing page</div>
              <div className="text-sm text-gray-600">/automotive</div>
            </div>
            <Link href="/admin/pages/automotive" className="text-sure-blue-600 hover:underline">Edit</Link>
          </div>
        </div>
        <Section title="Heavy Duty" items={hd} />
        <Section title="Automotive" items={auto} />
    </AdminContainer>
  );
}


