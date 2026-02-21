import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

import { getAssetUrl } from '@/lib/assets';
import ResourceDownloadForm from './ResourceDownloadForm';
import RelatedResources from '@/components/sections/RelatedResources';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { category, slug } = await params;

  // Fetch resource from database (Server-side)
  const resource = await prisma.resource.findFirst({
    where: { 
      slug,
      status: 'PUBLISHED',
      category: {
        slug: category,
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
        },
      },
      form: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  });

  if (!resource) {
    notFound();
  }

  const relatedResources = await prisma.resource.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: resource.categoryId,
      slug: { not: resource.slug },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      shortDescription: true,
      thumbnailImage: true,
      fileType: true,
      category: { select: { slug: true, name: true } },
    },
  });

  const thumbnailUrl = resource.thumbnailImage 
    ? getAssetUrl(resource.thumbnailImage)
    : 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  return (
    <main>
      <Header />
      
      {/* Compact Hero Section */}
      <CompactHero
        title={resource.title}
        description={resource.shortDescription || resource.description.substring(0, 150) + '...'}
        backgroundImage={thumbnailUrl}
        headingLevel="h2"
      />
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <a
              href={`/resources/${category}`}
              className="inline-flex items-center text-sure-blue-500 hover:text-sure-blue-600 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to {resource.category.name}
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2">
              {/* Resource Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-sure-blue-100 rounded-lg mr-4">
                    <DocumentTextIcon className="h-8 w-8 text-sure-blue-600" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                      {resource.category.name}
                    </span>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {resource.title}
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <span>{resource.fileType} Format</span>
                  {resource.fileSize && <span>{resource.fileSize}</span>}
                  {resource.fileMeta && <span>{resource.fileMeta}</span>}
                </div>
              </div>

              {/* Resource Description */}
              <div className="prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: resource.description }} />
              </div>
            </div>

            {/* Right Sidebar - Form (Client Component) */}
            <div className="lg:col-span-1">
              <ResourceDownloadForm
                resource={{
                  id: resource.id,
                  title: resource.title,
                  slug: resource.slug,
                  file: resource.file,
                  fileType: resource.fileType,
                  fileSize: resource.fileSize,
                  fileMeta: resource.fileMeta,
                  formId: resource.form?.id || null,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <RelatedResources resources={relatedResources} />

      <Footer />
    </main>
  );
}
