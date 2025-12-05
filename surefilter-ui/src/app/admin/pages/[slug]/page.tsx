import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import HomeHeroForm from './sections/HomeHeroForm';
import Link from 'next/link';
import SeoForm from './SeoForm';
import ReorderButtons from './ReorderButtons';
import DeletePageButton from './DeletePageButton';
import AddSectionForm from './sections/AddSectionForm';
import AdminContainer from '@/components/admin/AdminContainer';

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
      sections: { 
        orderBy: { position: 'asc' }, 
        include: { 
          section: {
            include: {
              sharedSection: true
            }
          }
        } 
      },
    },
  });
  if (!page) redirect('/admin/pages');

  // Find hero_full section for Home for now
  const sectionList = page.sections.map((s) => ({ 
    id: s.section.id, 
    type: s.section.type, 
    position: s.position,
    sharedSection: s.section.sharedSection ? {
      id: s.section.sharedSection.id,
      name: s.section.sharedSection.name,
    } : null,
  }));

  return (
    <AdminContainer className="space-y-8">
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
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm text-gray-700">{s.position}. {s.type}</span>
                  {s.sharedSection && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Shared: {s.sharedSection.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ReorderButtons slug={page.slug} sectionId={s.id} isFirst={idx === 0} isLast={idx === sectionList.length - 1} />
                  {s.sharedSection ? (
                    <Link href={`/admin/shared-sections/${s.sharedSection.id}`} className="text-purple-600 hover:underline">
                      Edit Shared
                    </Link>
                  ) : (
                    <a href={`/admin/sections/${s.id}`} className="text-sure-blue-600 hover:underline">Edit</a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
    </AdminContainer>
  );
}


