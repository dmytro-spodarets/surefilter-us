import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';

export const dynamic = 'force-dynamic';

export default async function AboutUsPage() {
  const page = await loadPageBySlug('about-us');
  const sections = page?.sections ?? [];
  return (
    <main>
      <Header />
      {sections.map((s) => (
        <div key={s.id}>{renderSection(s)}</div>
      ))}
      <Footer />
    </main>
  );
}