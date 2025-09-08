import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const metadata = { robots: { index: false, follow: false } };

export default async function ProductsPage({ searchParams }: any) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/products');

  const q = (searchParams?.q as string) || '';

  const where: any = q
    ? {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const items = await prisma.product.findMany({
    where,
    include: { filterType: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <div className="flex items-center gap-3">
            <form className="hidden md:block">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by code or name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72"
              />
            </form>
            <Link href="/admin/products/new" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg">
              New product
            </Link>
          </div>
        </div>

        <form className="md:hidden">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by code or name"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
          />
        </form>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filter Type</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{p.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.filterType?.name || '—'}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <Link href={`/admin/products/${p.id}`} className="text-sure-blue-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-600" colSpan={5}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
