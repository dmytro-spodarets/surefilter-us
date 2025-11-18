import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesClient from './ResourcesClient';

// Server Component - SEO оптимизирован ✅
// Header, Hero, Footer рендерятся на сервере с полными данными
export default async function ResourcesPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicResourcesHero />
      
      {/* Interactive Content - Client Component */}
      <ResourcesClient />
      
      <Footer />
    </main>
  );
}
