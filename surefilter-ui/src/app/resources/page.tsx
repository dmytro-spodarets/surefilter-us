import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesClient from './ResourcesClient';

// Server Component - SEO оптимизирован ✅
// Все данные загружаются на сервере
export default async function ResourcesPage() {
  // Загружаем данные на сервере
  // В dev режиме используем localhost, в production - полный URL
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  
  const [resourcesRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/api/resources`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/resources/categories`, { cache: 'no-store' })
  ]);
  
  const resourcesData = await resourcesRes.json();
  const categoriesData = await categoriesRes.json();
  
  // API возвращает массивы напрямую, не обернутые в объект
  const resources = Array.isArray(resourcesData) ? resourcesData : (resourcesData.resources || []);
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
  
  return (
    <main>
      <Header />
      
      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicResourcesHero />
      
      {/* Interactive Content - Client Component с server data */}
      <ResourcesClient 
        initialResources={resources}
        initialCategories={categories}
      />
      
      <Footer />
    </main>
  );
}
