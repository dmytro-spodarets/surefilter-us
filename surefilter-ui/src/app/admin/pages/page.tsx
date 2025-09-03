import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import NewPageForm from './NewPageForm';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PagesList() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/pages');

  const pages = await prisma.page.findMany({
    where: {
      AND: [
        { type: { not: 'INDUSTRY' } },
        { slug: { not: { startsWith: 'heavy-duty/' } } },
        { slug: { not: { startsWith: 'automotive/' } } },
      ],
    },
    orderBy: { slug: 'asc' },
  });

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Pages</h1>
          <div className="flex items-center gap-4">
            <NewPageForm />
            <div className="text-sm">
              <Link href="/admin" className="text-sure-blue-600 hover:underline">← Back to dashboard</Link>
            </div>
          </div>
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
      </div>
    </main>
  );
}


