import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import NewFilterTypeForm from './NewFilterTypeForm';

export const metadata = { robots: { index: false, follow: false } };

export default async function NewFilterType({ searchParams }: { searchParams: Promise<{ category?: 'HEAVY_DUTY' | 'AUTOMOTIVE' }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/filter-types/new');
  const { category = 'HEAVY_DUTY' } = await searchParams;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Filter Type</h1>
        <NewFilterTypeForm defaultCategory={category} />
      </div>
    </main>
  );
}


