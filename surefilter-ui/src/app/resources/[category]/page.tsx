import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesClient from '../ResourcesClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ category: string }>;
}

// Server Component - SEO оптимизирован ✅
export default async function ResourcesCategoryPage({ params }: PageProps) {
  const { category } = await params;
  
  // Загружаем данные на сервере
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  
  // Проверяем существует ли категория
  const categoryData = await prisma.resourceCategory.findFirst({
    where: {
      slug: category,
      isActive: true,
    },
  });

  if (!categoryData) {
    notFound();
  }

  const [resourcesRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/api/resources?category=${category}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/resources/categories`, { cache: 'no-store' })
  ]);
  
  const resourcesData = await resourcesRes.json();
  const categoriesData = await categoriesRes.json();
  
  const resources = resourcesData.resources || [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  return (
    <main>
      <Header />
      
      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicResourcesHero />
      
      {/* Interactive Content - Client Component с server data */}
      <ResourcesClient 
        initialResources={resources}
        initialCategories={categories}
        initialCategory={category}
      />
      
      <Footer />
    </main>
  );
}

// Generate metadata for SEO
