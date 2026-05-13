import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import CompactHero from '@/components/sections/CompactHero';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RelatedResources from '@/components/sections/RelatedResources';
import ResourceDownloadForm from '@/components/resources/ResourceDownloadForm';
import { sanitize } from '@/lib/sanitize';
import { getAssetUrl } from '@/lib/assets';

interface ResourceLike {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  thumbnailImage: string | null;
  file: string;
  fileType: string;
  fileSize: string | null;
  fileMeta: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
    parent: { id: string; name: string; slug: string } | null;
  };
  form: { id: string; name: string; slug: string; description: string | null } | null;
}

interface RelatedItem {
  slug: string;
  title: string;
  shortDescription: string | null;
  thumbnailImage: string | null;
  fileType: string;
  category: { slug: string; name: string; parent: { slug: string } | null };
}

interface ResourceDetailViewProps {
  resource: ResourceLike;
  related: RelatedItem[];
}

function buildCategoryPath(category: ResourceLike['category']) {
  return category.parent
    ? `/resources/${category.parent.slug}/${category.slug}`
    : `/resources/${category.slug}`;
}

export default function ResourceDetailView({ resource, related }: ResourceDetailViewProps) {
  const thumbnailUrl = resource.thumbnailImage
    ? getAssetUrl(resource.thumbnailImage)
    : 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  const categoryPath = buildCategoryPath(resource.category);

  const crumbs = [
    { label: 'Resources', href: '/resources' },
    ...(resource.category.parent
      ? [
          { label: resource.category.parent.name, href: `/resources/${resource.category.parent.slug}` },
          { label: resource.category.name, href: categoryPath },
        ]
      : [{ label: resource.category.name, href: categoryPath }]),
    { label: resource.title },
  ];

  return (
    <>
      <CompactHero
        title={resource.title}
        description={resource.shortDescription || resource.description.substring(0, 150) + '...'}
        backgroundImage={thumbnailUrl}
        headingLevel="h2"
      />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Breadcrumbs items={crumbs} className="mb-6" />

          <div className="mb-8">
            <a
              href={categoryPath}
              className="inline-flex items-center text-sure-blue-500 hover:text-sure-blue-600 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to {resource.category.name}
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
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

              <div className="prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: sanitize(resource.description) }} />
              </div>
            </div>

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

      <RelatedResources
        resources={related.map((r) => ({
          slug: r.slug,
          title: r.title,
          shortDescription: r.shortDescription,
          thumbnailImage: r.thumbnailImage,
          fileType: r.fileType,
          category: {
            slug: r.category.slug,
            name: r.category.name,
            parent: r.category.parent ? { slug: r.category.parent.slug } : null,
          },
        }))}
      />
    </>
  );
}
