import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadCachedPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';

export const metadata = {
  title: 'Industries We Serve | Sure Filter',
  description: 'Comprehensive filtration solutions for agriculture, construction, mining, marine, oil & gas, power generation, transportation, waste management, and rail industries.',
  keywords: 'industrial filters, heavy duty filtration, agriculture filters, construction filters, mining filters, marine filters, oil gas filters, power generation filters, transportation filters, waste management filters, rail filters',
};

export default async function IndustriesPage() {
  const page = await loadCachedPageBySlug('industries');
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
