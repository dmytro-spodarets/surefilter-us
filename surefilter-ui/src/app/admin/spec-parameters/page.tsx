import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = { robots: { index: false, follow: false } };

export default async function SpecParametersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/spec-parameters');

  const items = await prisma.specParameter.findMany({
    orderBy: [{ category: 'asc' }, { position: 'asc' }, { name: 'asc' }],
  });

  return (
    <AdminContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Specification Parameters</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/spec-parameters/new" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg">New parameter</Link>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.unit || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <Link href={`/admin/spec-parameters/${p.id}`} className="text-sure-blue-600 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-600" colSpan={6}>
                    No spec parameters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </AdminContainer>
  );
}
