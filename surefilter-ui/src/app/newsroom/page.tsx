import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicNewsroomHero from '@/components/sections/DynamicNewsroomHero';
import NewsroomClient from './NewsroomClient';

// Server Component - SEO оптимизирован ✅
// Все данные загружаются на сервере
export default async function NewsroomPage() {
  // Загружаем данные на сервере
  // В dev режиме используем localhost, в production - полный URL
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  
  const [eventsRes, newsRes] = await Promise.all([
    fetch(`${baseUrl}/api/news?type=EVENT&featured=true&limit=10`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/news?type=NEWS&limit=10`, { cache: 'no-store' })
  ]);
  
  const eventsData = await eventsRes.json();
  const newsData = await newsRes.json();
  
  return (
    <main>
      <Header />
      
      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicNewsroomHero />
      
      {/* Interactive Content - Client Component с server data */}
      <NewsroomClient 
        initialEvents={eventsData.articles || []}
        initialNews={newsData.articles || []}
      />
      
      <Footer />
    </main>
  );
}
