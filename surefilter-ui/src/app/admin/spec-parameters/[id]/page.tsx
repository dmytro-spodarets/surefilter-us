import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import SpecParameterForm from '../SpecParameterForm';

export const metadata = { robots: { index: false, follow: false } };

export default async function EditSpecParameterPage({ params }: any) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/admin/spec-parameters/${params.id}`);

  const item = await prisma.specParameter.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Specification Parameter</h1>
          <Link href="/admin/spec-parameters" className="text-sure-blue-600 hover:underline">← Back to spec parameters</Link>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <SpecParameterForm mode="edit" initial={item as any} />
        </div>
      </div>
    </main>
  );
}
