import Link from 'next/link';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface RelatedResource {
  slug: string;
  title: string;
  shortDescription: string | null;
  thumbnailImage: string | null;
  fileType: string;
  category: { slug: string; name: string };
}

interface RelatedResourcesProps {
  resources: RelatedResource[];
}

export default function RelatedResources({ resources }: RelatedResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Related Resources
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/resources/${resource.category.slug}/${resource.slug}`}
              className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:shadow-md transition-all"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                {resource.thumbnailImage ? (
                  <ManagedImage
                    src={resource.thumbnailImage}
                    alt={resource.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 bg-sure-blue-50 text-sure-blue-700 text-xs font-medium rounded-full">
                    {resource.category.name}
                  </span>
                  <span className="text-xs text-gray-400">{resource.fileType}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-sure-blue-600 transition-colors line-clamp-2">
                  {resource.title}
                </h3>
                {resource.shortDescription && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {resource.shortDescription}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
