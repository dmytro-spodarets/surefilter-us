import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getAssetUrl } from '@/lib/assets';

export default async function IndustriesList({ title = 'Our Industries', description = 'Specialized filtration solutions tailored to the unique challenges of each industry' }: { title?: string; description?: string }) {
  const industryPages = await prisma.page.findMany({
    where: { type: 'INDUSTRY' },
    include: { sections: { include: { section: true } } },
    orderBy: { slug: 'asc' },
  });
  const cards = industryPages.map((p) => {
    const meta = p.sections.find((ps) => ps.section.type === 'listing_card_meta')?.section.data as any;
    const slug = p.slug.split('/').slice(1).join('/');
    return {
      slug,
      title: meta?.listTitle || p.title,
      description: meta?.listDescription || p.description || '',
      image: meta?.listImage || '',
      popularFilters: Array.isArray(meta?.popularFilters) ? meta.popularFilters : [],
    };
  });

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {cards.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-sure-blue-200"
            >
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                {industry.image ? (
                  <Image src={getAssetUrl(industry.image)} alt={industry.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sure-blue-100 transition-colors duration-200">
                    {industry.title}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{industry.description}</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Popular Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {industry.popularFilters.map((filter: string, index: number) => (
                      <span key={`${filter}-${index}`} className="text-xs bg-sure-blue-50 text-sure-blue-700 px-3 py-1 rounded-full border border-sure-blue-200">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
