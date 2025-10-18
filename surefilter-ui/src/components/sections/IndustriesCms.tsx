import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getAssetUrl } from '@/lib/assets';

export default async function IndustriesCms({ title, description }: { title?: string; description?: string }) {
  const pages = await prisma.page.findMany({
    where: { type: 'INDUSTRY' },
    include: { sections: { include: { section: true } } },
    orderBy: { slug: 'asc' },
  });
  const items = pages.map((p) => {
    const meta = p.sections.find((ps) => ps.section.type === 'listing_card_meta')?.section.data as any;
    const slugTail = p.slug.split('/').slice(1).join('/');
    return {
      name: meta?.listTitle || p.title,
      description: meta?.listDescription || p.description || '',
      image: meta?.listImage || '',
      href: `/industries/${slugTail}`,
    };
  });

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          {title && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
          {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <Link key={it.href} href={it.href || '#'} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-sure-blue-200">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {it.image && (
                  <Image 
                    src={getAssetUrl(it.image)} 
                    alt={it.name} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-sure-blue-600 transition-colors duration-200">{it.name}</h3>
                {it.description && <p className="text-gray-600 text-sm">{it.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


