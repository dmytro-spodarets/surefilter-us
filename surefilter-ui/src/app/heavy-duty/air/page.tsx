import Header from '@/components/layout/Header';
import PageHero from '@/components/sections/PageHero';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

export const metadata = {
  title: 'Heavy Duty Air Filters | Sure Filter®',
  description: 'Premium heavy duty air filters for construction, mining, and industrial equipment. Superior engine protection with advanced filtration technology.',
};

export default function HeavyDutyAirFiltersPage() {
  const relatedFilters = [
    { name: 'Oil Filters', href: '/heavy-duty/oil' },
    { name: 'Fuel Filters', href: '/heavy-duty/fuel' },
    { name: 'Cabin Filters', href: '/heavy-duty/cabin' },
  ];

  const compatibleIndustries = [
    { name: 'Construction Equipment', icon: 'TruckIcon', description: 'Excavators, bulldozers, loaders' },
    { name: 'Mining Operations', icon: 'RockingChairIcon', description: 'Drilling rigs, haul trucks' },
    { name: 'Agricultural Machinery', icon: 'HomeModernIcon', description: 'Tractors, harvesters, tillers' },
    { name: 'Industrial Equipment', icon: 'BuildingOfficeIcon', description: 'Compressors, generators' },
    { name: 'Marine Applications', icon: 'GlobeAltIcon', description: 'Ship engines, offshore rigs' },
    { name: 'Power Generation', icon: 'BoltIcon', description: 'Diesel generators, backup power' },
  ];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <PageHero
        title="Heavy Duty Air Filters"
        description="Advanced filtration technology for extreme operating conditions. Our heavy duty air filters provide superior engine protection and extended service life in the harshest environments."
      />

      {/* About Air Filters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Maximum Engine Protection
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Heavy duty air filters are essential for protecting engines from dust, dirt, and debris 
                in demanding environments. Our advanced filtration media captures even the smallest 
                particles while maintaining optimal airflow for peak engine performance.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="CloudIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">99.9% Efficiency</h3>
                  <p className="text-gray-600 text-sm">
                    Captures particles down to 1 micron with minimal airflow restriction
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="ClockIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Extended Life</h3>
                  <p className="text-gray-600 text-sm">
                    High dust-holding capacity for longer service intervals
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="ShieldCheckIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Extreme Conditions</h3>
                  <p className="text-gray-600 text-sm">
                    Designed for dusty, high-vibration environments
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="WrenchScrewdriverIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Maintenance</h3>
                  <p className="text-gray-600 text-sm">
                    Quick-change design for faster service operations
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Advanced Technology
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Multi-Layer Media:</strong>
                    <span className="text-gray-600 ml-1">Progressive filtration stages for maximum efficiency</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Nano-Fiber Technology:</strong>
                    <span className="text-gray-600 ml-1">Ultra-fine fibers trap microscopic particles</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Moisture Resistant:</strong>
                    <span className="text-gray-600 ml-1">Maintains performance in high-humidity conditions</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Reinforced Construction:</strong>
                    <span className="text-gray-600 ml-1">Heavy-duty frame withstands vibration and shock</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Air Filters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Heavy Duty Air Filters
            </h2>
            <p className="text-lg text-gray-600">
              Our most trusted air filters for heavy-duty applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { part: 'HD-AIR-2001', name: 'Heavy Duty Engine Air Filter', desc: 'Primary air filtration for engines' },
              { part: 'HD-AIR-2002', name: 'Secondary Air Filter', desc: 'Safety element for dual-stage systems' },
              { part: 'HD-AIR-2003', name: 'Radial Seal Air Filter', desc: 'Superior sealing in dusty conditions' },
              { part: 'HD-AIR-2004', name: 'Panel Air Filter', desc: 'Rectangular design for specific applications' },
              { part: 'HD-AIR-2005', name: 'Conical Air Filter', desc: 'High-flow performance filter' },
              { part: 'HD-AIR-2006', name: 'Pre-Cleaner Assembly', desc: 'Centrifugal pre-separation system' },
            ].map((product, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Icon name="CloudIcon" className="w-16 h-16 text-gray-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {product.desc}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Part #: {product.part}</span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Cross-Reference */}
      <section className="py-16 bg-sure-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Air Filter
            </h2>
            <p className="text-lg text-gray-600">
              Search by part number, equipment model, or find cross-references
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                <Input placeholder="Enter air filter part number..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Model</label>
                <Input placeholder="e.g., CAT 320D, John Deere 8320..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cross Reference</label>
                <Input placeholder="Competitor part number..." />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-sure-red-500 hover:bg-sure-red-600">
                <Icon name="MagnifyingGlassIcon" className="w-5 h-5 mr-2" />
                Search Air Filters
              </Button>
              <Button variant="outline" className="flex-1">
                <Icon name="DocumentTextIcon" className="w-5 h-5 mr-2" />
                Browse Catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Compatible Industries */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compatible Industries
            </h2>
            <p className="text-lg text-gray-600">
              Heavy duty air filters for diverse industrial applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {compatibleIndustries.map((industry) => (
              <div key={industry.name} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                <Icon name={industry.icon} className="w-10 h-10 text-sure-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{industry.name}</h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Filter Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Related Filter Types
            </h2>
            <p className="text-lg text-gray-600">
              Complete your filtration system with related heavy duty filters
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedFilters.map((filter) => (
              <Card key={filter.name} className="text-center hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{filter.name}</h3>
                  <Button href={filter.href} variant="outline" className="w-full">
                    Explore {filter.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Air Filters */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Sure Filter® Air Filters
            </h2>
            <p className="text-lg text-gray-300">
              Superior protection, quality, and performance you can trust
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ShieldCheckIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maximum Efficiency</h3>
              <p className="text-gray-300">
                99.9% filtration efficiency protects your engine from harmful contaminants.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ClockIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Extended Service Life</h3>
              <p className="text-gray-300">
                High dust-holding capacity extends service intervals and reduces costs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="PhoneIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-300">
                Technical support and application assistance from filtration experts.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/warranty" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              <Icon name="DocumentTextIcon" className="w-5 h-5 mr-2" />
              View Warranty
            </Button>
            <Button href="/quality" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <Icon name="StarIcon" className="w-5 h-5 mr-2" />
              Quality Standards
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
