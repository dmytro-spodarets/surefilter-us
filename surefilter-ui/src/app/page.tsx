import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import WhyChoose from '@/components/sections/WhyChoose';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import QuickSearch from '@/components/sections/QuickSearch';
import Industries from '@/components/sections/Industries';
import AboutNews from '@/components/sections/AboutNews';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <WhyChoose />
      <FeaturedProducts />
      <QuickSearch />
      <Industries />
      <AboutNews />
      <Footer />
    </main>
  );
} 