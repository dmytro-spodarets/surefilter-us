import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicNewsroomHero from '@/components/sections/DynamicNewsroomHero';
import NewsroomClient from './NewsroomClient';
import { prisma } from '@/lib/prisma';

// Server Component - SEO оптимизирован ✅
// Все данные загружаются на сервере напрямую из БД
export default async function NewsroomPage() {
  const now = new Date();

  const [events, news] = await Promise.all([
    // Featured future events, sorted by soonest first
    prisma.newsArticle.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        type: 'EVENT',
        isFeatured: true,
        eventStartDate: { gte: now },
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true, icon: true },
        },
      },
      orderBy: { eventStartDate: 'asc' },
      take: 10,
    }),
    // Latest news, sorted by newest first
    prisma.newsArticle.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        type: 'NEWS',
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true, icon: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <main>
      <Header />

      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicNewsroomHero />

      {/* Interactive Content - Client Component с server data */}
      <NewsroomClient
        initialEvents={JSON.parse(JSON.stringify(events))}
        initialNews={JSON.parse(JSON.stringify(news))}
      />

      <Footer />
    </main>
  );
}
