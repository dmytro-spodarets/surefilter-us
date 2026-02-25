import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = { robots: { index: false, follow: false } };

export default async function ProductFilterTypesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/products/product-filter-types');

  const filterTypes = await prisma.productFilterType.findMany({
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <AdminContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Filter Types</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage filter types for your product catalog (Air, Oil, Fuel, etc.)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="text-sure-blue-600 hover:underline"
            >
              ← Back to Products
            </Link>
            <Link
              href="/admin/products/product-filter-types/new"
              className="bg-sure-blue-600 text-white px-4 py-2 rounded-lg hover:bg-sure-blue-700"
            >
              New Filter Type
            </Link>
          </div>
        </div>

        {/* Filter Types List */}
        {filterTypes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">No filter types yet</p>
            <Link
              href="/admin/products/product-filter-types/new"
              className="inline-block bg-sure-blue-600 text-white px-4 py-2 rounded-lg hover:bg-sure-blue-700"
            >
              Create First Filter Type
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filterTypes.map((filterType) => (
                  <tr key={filterType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {filterType.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {filterType.icon && (
                          <span className="text-xl">{filterType.icon}</span>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {filterType.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {filterType.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {filterType.code || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {filterType._count.products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          filterType.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {filterType.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/products/product-filter-types/${filterType.id}`}
                        className="text-sure-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminContainer>
  );
}
