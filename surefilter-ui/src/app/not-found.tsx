import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main>
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 pt-28 pb-20">
        <div className="text-center max-w-lg">
          <p className="text-[8rem] font-bold leading-none text-gray-200 select-none">404</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-4 text-lg text-gray-600">
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/" variant="primary" size="lg">
              Go to Homepage
            </Button>
            <Button href="/catalog" variant="outline" size="lg">
              Browse Catalog
            </Button>
            <Button href="/contact-us" variant="ghost" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
