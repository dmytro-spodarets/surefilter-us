import Link from 'next/link';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface RelatedArticle {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: Date;
  category: { name: string } | null;
}

interface RelatedNewsProps {
  articles: RelatedArticle[];
}

export default function RelatedNews({ articles }: RelatedNewsProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Related News
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/newsroom/${article.slug}`}
              className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:shadow-md transition-all"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                {article.featuredImage ? (
                  <ManagedImage
                    src={article.featuredImage}
                    alt={article.featuredImageAlt || article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-4">
                {article.category && (
                  <span className="inline-block px-2 py-0.5 bg-sure-blue-50 text-sure-blue-700 text-xs font-medium rounded-full mb-2">
                    {article.category.name}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-sure-blue-600 transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
