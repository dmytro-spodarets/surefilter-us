import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadCachedPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';

export const dynamic = 'force-dynamic';

export default async function HeavyDutyPage() {
  const page = await loadCachedPageBySlug('heavy-duty');
  return (
    <main>
      <Header />
      {(page?.sections || []).map((s) => (
        <div key={s.id}>{renderSection(s)}</div>
      ))}
      <Footer />
    </main>
  );
}