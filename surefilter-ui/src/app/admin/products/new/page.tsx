import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import ProductForm from '../ProductForm';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = { robots: { index: false, follow: false } };

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/products/new');

  const [filterTypes, specParameters] = await Promise.all([
    prisma.filterType.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, category: true, fullSlug: true },
    }),
    prisma.specParameter.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { position: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, unit: true, category: true, position: true, isActive: true },
    }),
  ]);

  return (
    <AdminContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">New Product</h1>
          <Link href="/admin/products" className="text-sure-blue-600 hover:underline">← Back to products</Link>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <ProductForm mode="create" filterTypes={filterTypes as any} specParameters={specParameters as any} />
        </div>
    </AdminContainer>
  );
}

