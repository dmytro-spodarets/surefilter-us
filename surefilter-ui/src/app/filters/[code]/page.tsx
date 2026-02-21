import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import ProductGallery from '@/components/sections/ProductGallery';
import ProductSpecs from '@/components/sections/ProductSpecs';

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ code: string }>;
}

type ProductData = {
  code: string;
  name: string;
  category: string;
  status?: string;
  filterType?: string;
  description?: string;
  images: { src: string; alt?: string }[];
  specsLeft: { label: string; value: string | number }[];
  specsRight: { label: string; value: string | number }[];
  oems?: { number: string; manufacturer: string }[];
};

function getMockProduct(codeRaw: string): ProductData {
  const code = codeRaw.toUpperCase();

  const MOCK: Record<string, ProductData> = {
    SFO241: {
      code,
      name: 'SureFilter Engine Oil Filter',
      category: 'Oil Filter',
      filterType: 'Spin-On',
      status: 'Release Product',
      description:
        'Premium spin-on oil filter engineered for dependable engine protection. Built to SAE/JIS/DIN standards with reinforced construction and high‑efficiency media for consistent flow and long service life. Designed to reduce pressure drop and capture fine contaminants that accelerate wear. Ideal for heavy‑duty duty cycles with extended intervals when used as specified by the engine manufacturer.',
      images: [
        { src: '/images/image.jpg', alt: `${code} main image` },
        { src: '/images/image-2.jpg', alt: `${code} detail image` },
      ],
      specsLeft: [
        { label: 'Height (mm)', value: 77 },
        { label: 'Outer Diameter (mm)', value: 76 },
        { label: 'Thread', value: '3/4"x16' },
        { label: 'Model', value: 'Spin-On' },
      ],
      specsRight: [
        { label: 'Height (in.)', value: '3.03' },
        { label: 'Outer Diameter (in.)', value: '2.99' },
        { label: 'Type', value: 'Oil' },
        { label: 'Filter Info', value: 'SUREFILTER OIL FILTER' },
      ],
      oems: [
        { number: '26721-84801', manufacturer: 'HYUNDAI' },
      ],
    },
    SFG84801E: {
      code,
      name: 'SureFilter Blow-by Gas Filter',
      category: 'Blow-by Gas Filter',
      filterType: 'Element',
      status: 'Release Product',
      description:
        'High‑performance blow‑by gas filter element designed to reduce oil mist and crankcase emissions. Optimized media structure maintains ventilation while protecting turbochargers and aftertreatment components from fouling. Stable performance under high temperature and pulsation typical for off‑road and on‑highway diesel engines.',
      images: [
        { src: '/images/image-3.jpg', alt: `${code} main image` },
        { src: '/images/image-4.jpg', alt: `${code} kit image` },
      ],
      specsLeft: [
        { label: 'H1 (mm)', value: 152 },
        { label: 'OD 1 (mm)', value: 97 },
        { label: 'ID 1 (mm)', value: 23 },
        { label: 'Model', value: 'Element' },
      ],
      specsRight: [
        { label: 'Filter Info', value: 'Eco' },
        { label: 'Status', value: 'Release Product' },
        { label: 'Type', value: 'Blow-by Gas Filter' },
        { label: 'OEM Example', value: '26721-84801 (HYUNDAI)' },
      ],
      oems: [
        { number: '26721-84801', manufacturer: 'HYUNDAI' },
      ],
    },
  };

  if (MOCK[code]) return MOCK[code];

  return {
    code,
    name: 'SureFilter Engine Oil Filter',
    category: 'Oil Filter',
    status: 'Release Product',
    filterType: 'Spin-On',
    description:
      'Premium spin‑on oil filter engineered for dependable engine protection and consistent flow during extended service intervals.',
    images: [{ src: '/images/image.jpg', alt: `${code} main image` }],
    specsLeft: [
      { label: 'Height (mm)', value: 77 },
      { label: 'Outer Diameter (mm)', value: 76 },
      { label: 'Thread', value: '3/4"x16' },
      { label: 'Model', value: 'Spin-On' },
    ],
    specsRight: [
      { label: 'Height (in.)', value: '3.03' },
      { label: 'Outer Diameter (in.)', value: '2.99' },
      { label: 'Type', value: 'Oil' },
      { label: 'Filter Info', value: 'OEM equivalent' },
    ],
    oems: [],
  };
}

export default async function FilterDetailsPage({ params }: PageProps) {
  const { code } = await params;
  const product = getMockProduct(code);

  return (
    <main>
      <Header />

      {/* Hero без поиска */}
      <CompactHero
        title={product.code}
        description={product.name}
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      {/* Контент: слева описание+specs (4/6), справа галерея (2/6) */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-6 gap-10 items-start">
          {/* Left: 4/6 */}
          <div className="md:col-span-4">
            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            <ProductSpecs left={product.specsLeft} right={product.specsRight} title="Specifications" contained={false} />
          </div>

          {/* Right: 2/6 */}
          <div className="md:col-span-2 md:sticky md:top-28">
            <ProductGallery images={product.images} />
          </div>
        </div>
      </section>

      {/* OEM NUMBER таблица */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">OEM NUMBER</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-600">OEM NUMBER</th>
                  <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-600">MANUFACTURER</th>
                </tr>
              </thead>
              <tbody>
                {(product.oems && product.oems.length > 0 ? product.oems : [{ number: '—', manufacturer: '—' }]).map((row, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.manufacturer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
