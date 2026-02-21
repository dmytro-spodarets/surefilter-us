import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesClient from '../ResourcesClient';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ category: string }>;
}

// Server Component - SEO оптимизирован ✅
export default async function ResourcesCategoryPage({ params }: PageProps) {
  const { category } = await params;

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

  const [resources, categories] = await Promise.all([
    prisma.resource.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        category: { slug: category, isActive: true },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnailImage: true,
        file: true,
        fileType: true,
        fileSize: true,
        fileMeta: true,
        allowDirectDownload: true,
        allowPreview: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.resourceCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            resources: {
              where: {
                status: 'PUBLISHED',
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
    }),
  ]);

  return (
    <main>
      <Header />

      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicResourcesHero />

      {/* Interactive Content - Client Component с server data */}
      <Suspense>
        <ResourcesClient
          initialResources={JSON.parse(JSON.stringify(resources))}
          initialCategories={JSON.parse(JSON.stringify(categories))}
          initialCategory={category}
        />
      </Suspense>

      <Footer />
    </main>
  );
}
