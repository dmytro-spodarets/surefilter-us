import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export const metadata = { robots: { index: false, follow: false } };

export default async function NewFilterType({ searchParams }: { searchParams: Promise<{ category?: 'HEAVY_DUTY' | 'AUTOMOTIVE' }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin/filter-types/new');
  const { category = 'HEAVY_DUTY' } = await searchParams;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Filter Type</h1>
        <form action="/api/admin/filter-types" method="post" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input name="name" placeholder="Air Filters" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea name="description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
          <div className="flex justify-end">
            <button type="button" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg" onClick={async () => {
              const form = document.querySelector('form') as HTMLFormElement;
              const formData = new FormData(form);
              const payload: any = {
                category: formData.get('category'),
                parentId: (formData.get('parentId') as string) || null,
                slug: formData.get('slug'),
                name: formData.get('name'),
                description: formData.get('description'),
              };
              const res = await fetch('/api/admin/filter-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              if (res.ok) {
                location.href = '/admin/filter-types';
              } else {
                alert(await res.text());
              }
            }}>Create</button>
          </div>
        </form>
      </div>
    </main>
  );
}


