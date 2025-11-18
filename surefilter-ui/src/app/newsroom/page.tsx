import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicNewsroomHero from '@/components/sections/DynamicNewsroomHero';
import NewsroomClient from './NewsroomClient';

// Server Component - SEO оптимизирован ✅
// Header, Hero, Footer рендерятся на сервере с полными данными
export default async function NewsroomPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicNewsroomHero />
      
      {/* Interactive Content - Client Component */}
      <NewsroomClient />
      
      <Footer />
    </main>
  );
}
