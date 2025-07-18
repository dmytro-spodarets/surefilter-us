import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FullScreenHero from '@/components/sections/FullScreenHero';
import IndustriesList from '@/components/sections/IndustriesList';

export const metadata = {
  title: 'Industries We Serve | Sure Filter',
  description: 'Comprehensive filtration solutions for agriculture, construction, mining, marine, oil & gas, power generation, transportation, waste management, and rail industries.',
  keywords: 'industrial filters, heavy duty filtration, agriculture filters, construction filters, mining filters, marine filters, oil gas filters, power generation filters, transportation filters, waste management filters, rail filters',
};

export default function IndustriesPage() {
  return (
    <main>
      <Header />
      
      <FullScreenHero 
        title="Industries We Serve"
        description="Comprehensive filtration solutions for agriculture, construction, mining, marine, oil & gas, power generation, transportation, waste management, and rail industries."
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />
      
      <IndustriesList />

      <Footer />
    </main>
  );
}
