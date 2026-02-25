import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import NewFilterTypeForm from './NewFilterTypeForm';

export const metadata = { robots: { index: false, follow: false } };

export default async function NewFilterType({ searchParams }: { searchParams?: Promise<{ category?: 'HEAVY_DUTY' | 'AUTOMOTIVE' }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/filter-types/new');
  const sp = (await searchParams) ?? {};
  const category = sp.category === 'AUTOMOTIVE' ? 'AUTOMOTIVE' : 'HEAVY_DUTY';

  return (
    <div className="p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Filter Type</h1>
        <NewFilterTypeForm defaultCategory={category} />
      </div>
    </div>
  );
}


