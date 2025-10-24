import { prisma } from '@/lib/prisma';

async function getLatestNews(count: number = 5) {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date()
        }
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: count
    });

    return articles.map(article => ({
      title: article.title,
      excerpt: article.excerpt,
      date: new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      category: article.category?.name || 'News',
      href: `/newsroom/${article.slug}`
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function AboutNewsCms({
  aboutTitle,
  aboutParagraphs = [],
  stats = [] as { number: string; label: string }[],
  aboutCtaLabel = 'Learn More About Us',
  aboutCtaHref = '#',
  newsTitle,
  newsCount = 5,
  newsCtaLabel = 'See All News',
  newsCtaHref = '/newsroom',
}: {
  aboutTitle?: string;
  aboutParagraphs?: string[];
  stats?: { number: string; label: string }[];
  aboutCtaLabel?: string;
  aboutCtaHref?: string;
  newsTitle?: string;
  newsCount?: number;
  newsCtaLabel?: string;
  newsCtaHref?: string;
}) {
  const newsItems = await getLatestNews(newsCount);
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-sure-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{aboutTitle}</h2>
            {aboutParagraphs.map((p, i) => (
              <p key={i} className={`text-${i === 0 ? 'lg' : 'base'} text-gray-600 leading-relaxed ${i === 0 ? 'mb-6' : 'mb-8'}`}>
                {p}
              </p>
            ))}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-sure-blue-600 mb-1">{s.number}</div>
                    <div className="text-xs text-gray-600 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-auto">
              <a href={aboutCtaHref} className="px-8 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-600 transition-colors duration-200">
                {aboutCtaLabel}
              </a>
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{newsTitle}</h2>
            <div className="space-y-4 mb-8">
              {newsItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No news articles yet</p>
                  <a href="/admin/news" className="text-sure-blue-600 hover:underline text-sm">
                    Create your first article
                  </a>
                </div>
              ) : (
                newsItems.map((n, i) => (
                  <a 
                    key={i} 
                    href={n.href}
                    className="group block p-4 -mx-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {/* Мета информация */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {n.category}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{n.date}</span>
                    </div>
                    
                    {/* Заголовок */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-sure-blue-600 transition-colors leading-snug">
                      {n.title}
                    </h3>
                    
                    {/* Описание */}
                    {n.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {n.excerpt}
                      </p>
                    )}
                    
                    {/* Read more появляется при hover */}
                    <div className="mt-2 flex items-center text-sm font-medium text-sure-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Read more</span>
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
            <div className="mt-auto">
              <a 
                href={newsCtaHref} 
                className="inline-block px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200"
              >
                {newsCtaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


