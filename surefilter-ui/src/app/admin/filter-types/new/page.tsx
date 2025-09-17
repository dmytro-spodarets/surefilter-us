import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { createFilterType } from './actions';

export const metadata = { robots: { index: false, follow: false } };

export default async function NewFilterType({ searchParams }: { searchParams: { category?: 'HEAVY_DUTY' | 'AUTOMOTIVE' } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/filter-types/new');
  const { category = 'HEAVY_DUTY' } = searchParams;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Filter Type</h1>
        <form action={createFilterType} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Category</label>
            <select name="category" defaultValue={category} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="HEAVY_DUTY">Heavy Duty</option>
              <option value="AUTOMOTIVE">Automotive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Parent ID (optional)</label>
            <input name="parentId" placeholder="parent type id" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Slug</label>
            <input name="slug" placeholder="air" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Page Title</label>
            <input name="pageTitle" placeholder="Heavy Duty Air Filters" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea name="description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg">Create</button>
          </div>
        </form>
      </div>
    </main>
  );
}


