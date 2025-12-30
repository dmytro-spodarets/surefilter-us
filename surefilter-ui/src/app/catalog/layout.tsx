import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
