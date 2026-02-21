import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicNewsroomHero from '@/components/sections/DynamicNewsroomHero';
import NewsroomClient from './NewsroomClient';
import { prisma } from '@/lib/prisma';

export const revalidate = 86400;
export default async function NewsroomPage() {
  let events: any[] = [];
  let news: any[] = [];
  try {
    const now = new Date();
    [events, news] = await Promise.all([
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
  } catch {
    // DB unavailable during build — render with empty data, ISR will populate at runtime
  }

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
