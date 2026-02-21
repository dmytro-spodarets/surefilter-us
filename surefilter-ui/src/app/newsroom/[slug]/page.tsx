import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import { ArrowLeftIcon, CalendarDaysIcon, TagIcon, MapPinIcon, LinkIcon } from '@heroicons/react/24/outline';
import { prisma } from '@/lib/prisma';
import { getNewsArticlePageSettings } from '@/lib/site-settings';
import { getAssetUrl } from '@/lib/assets';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ManagedImage } from '@/components/ui/ManagedImage';
import RelatedNews from '@/components/sections/RelatedNews';

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticleBySlug(slug: string) {
  const article = await prisma.newsArticle.findUnique({
    where: { 
      slug,
      status: 'PUBLISHED'
    },
    include: {
      category: {
        select: {
          name: true,
          color: true,
          icon: true
        }
      }
    }
  });

  return article;
}

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const isEvent = article.type === 'EVENT';
  const [articleSettings, relatedArticles] = await Promise.all([
    getNewsArticlePageSettings(),
    prisma.newsArticle.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        slug: { not: article.slug },
        ...(article.categoryId ? { categoryId: article.categoryId } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        featuredImageAlt: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const heroTitle = isEvent ? articleSettings.eventTitle : articleSettings.newsTitle;
  const heroDescription = isEvent ? articleSettings.eventDescription : articleSettings.newsDescription;
  const settingsHeroImage = isEvent ? articleSettings.eventHeroImage : articleSettings.newsHeroImage;
  const heroImage = settingsHeroImage
    ? getAssetUrl(settingsHeroImage)
    : article.ogImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  return (
    <main>
      <Header />

      {/* Compact Hero Section */}
      <CompactHero
        title={heroTitle}
        description={heroDescription}
        backgroundImage={heroImage}
        headingLevel="h2"
      />
      
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href="/newsroom"
              className="inline-flex items-center text-sure-blue-500 hover:text-sure-blue-600 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Newsroom
            </Link>
          </div>

          {/* Article Content */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-4 flex-wrap gap-3">
                {article.category && (
                  <span className="inline-flex items-center px-3 py-1 bg-sure-blue-100 text-sure-blue-800 text-sm font-medium rounded-full">
                    {article.category.name}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {isEvent && article.eventStartDate ? (
                    <>
                      {new Date(article.eventStartDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      {article.eventEndDate && ` - ${new Date(article.eventEndDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric' 
                      })}`}
                    </>
                  ) : (
                    new Date(article.publishedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                  )}
                </span>
                {isEvent && article.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-sure-orange-100 text-sure-orange-800">
                    Featured Event
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {article.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Event-specific metadata */}
              {isEvent && (
                <div className="mt-6 space-y-3 bg-gray-50 rounded-lg p-4">
                  {(article.venue || article.location) && (
                    <div className="flex items-start text-gray-700">
                      <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        {article.venue && <div className="font-medium">{article.venue}</div>}
                        {article.location && <div className="text-sm">{article.location}</div>}
                      </div>
                    </div>
                  )}
                  {article.booth && (
                    <div className="flex items-center text-gray-700">
                      <TagIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{article.booth}</span>
                    </div>
                  )}
                  {article.eventUrl && (
                    <div className="flex items-center text-gray-700">
                      <LinkIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <a 
                        href={article.eventUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sure-blue-500 hover:text-sure-blue-600 hover:underline"
                      >
                        Event Website →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative w-full h-96">
                <ManagedImage
                  src={article.featuredImage}
                  alt={article.featuredImageAlt || article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4 flex-wrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    Published: {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  {article.category && (
                    <div className="flex items-center text-sm text-gray-600">
                      <TagIcon className="h-4 w-4 mr-1" />
                      {article.category.name}
                    </div>
                  )}
                  {article.author && (
                    <div className="text-sm text-gray-600">
                      By {article.author}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm text-gray-500">Tags:</span>
                    {article.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      <RelatedNews articles={relatedArticles} />

      <Footer />
    </main>
  );
}

