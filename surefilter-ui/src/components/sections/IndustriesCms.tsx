import Image from 'next/image';
import Link from 'next/link';

interface Item { name: string; description?: string; image?: string; href?: string }

export default function IndustriesCms({ title, description, items = [] as Item[] }: { title?: string; description?: string; items?: Item[] }) {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          {title && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
          {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, idx) => (
            <Link key={idx} href={it.href || '#'} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-sure-blue-200">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {it.image && (
                  <Image src={it.image} alt={it.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
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


