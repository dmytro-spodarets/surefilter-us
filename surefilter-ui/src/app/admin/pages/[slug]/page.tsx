import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import HomeHeroForm from './sections/HomeHeroForm';
import Link from 'next/link';
import SeoForm from './SeoForm';
import ReorderButtons from './ReorderButtons';
import DeletePageButton from './DeletePageButton';
import AddSectionForm from './sections/AddSectionForm';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/admin/pages/${slug}`);

  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      sections: { orderBy: { position: 'asc' }, include: { section: true } },
    },
  });
  if (!page) redirect('/admin/pages');

  // Find hero_full section for Home for now
  const sectionList = page.sections.map((s) => ({ id: s.section.id, type: s.section.type, position: s.position }));

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit: {page.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-sure-blue-600 hover:underline">← Back to dashboard</Link>
            <Link href="/admin/pages" className="text-sure-blue-600 hover:underline">← Back to pages</Link>
          </div>
        </div>

        <section className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 mb-4">SEO</h2>
            <DeletePageButton slug={page.slug} />
          </div>
          <SeoForm slug={page.slug} initial={{ title: page.title, description: page.description, ogImage: page.ogImage }} />
        </section>

        <section className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sections</h2>
          <div className="mb-3 text-sm text-gray-600">Use the list below to reorder and edit sections. To add a new section, use the dropdown:</div>
          <AddSectionForm slug={page.slug} />
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {sectionList.map((s, idx) => (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-sm text-gray-700 flex-1">{s.position}. {s.type}</div>
                <div className="flex items-center gap-3">
                  <ReorderButtons slug={page.slug} sectionId={s.id} isFirst={idx === 0} isLast={idx === sectionList.length - 1} />
                  <a href={`/admin/pages/${page.slug}/sections/${s.id}`} className="text-sure-blue-600 hover:underline">Edit</a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}


