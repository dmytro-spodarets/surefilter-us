import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeroReverse from '@/components/sections/PageHeroReverse';
import MagnussonMossAct from '@/components/sections/MagnussonMossAct';
import QualityAssurance from '@/components/sections/QualityAssurance';
import LimitedWarrantyDetails from '@/components/sections/LimitedWarrantyDetails';
import WarrantyContact from '@/components/sections/WarrantyContact';

export default function WarrantyPage() {
  return (
    <main>
      <Header />
      
      <PageHeroReverse 
        title="Quality Assurance & Warranty"
        description="Sure Filter® stands behind every product with comprehensive warranty coverage and world-class quality assurance. Our commitment to excellence ensures your complete satisfaction and protection."
      />
      
      <MagnussonMossAct />
      
      <QualityAssurance />
      
      <LimitedWarrantyDetails />
      
      <WarrantyContact />
      
      <Footer />
    </main>
  );
}