import Header from '@/components/layout/Header';
import PageHero from '@/components/sections/PageHero';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

export const metadata = {
  title: 'Heavy Duty Fuel Filters | Sure Filter®',
  description: 'Premium heavy duty fuel filters for diesel engines. Superior fuel system protection with advanced separation technology.',
};

export default function HeavyDutyFuelFiltersPage() {
  const relatedFilters = [
    { name: 'Oil Filters', href: '/heavy-duty/oil' },
    { name: 'Air Filters', href: '/heavy-duty/air' },
    { name: 'Water Separator', href: '/heavy-duty/water-separator' },
  ];

  const compatibleIndustries = [
    { name: 'Construction Equipment', icon: 'TruckIcon', description: 'Excavators, bulldozers, graders' },
    { name: 'Mining Operations', icon: 'RockingChairIcon', description: 'Haul trucks, mining equipment' },
    { name: 'Agricultural Machinery', icon: 'HomeModernIcon', description: 'Tractors, combines, implements' },
    { name: 'Marine Applications', icon: 'GlobeAltIcon', description: 'Ship engines, marine generators' },
    { name: 'Transportation', icon: 'TruckIcon', description: 'Heavy trucks, buses, commercial vehicles' },
    { name: 'Power Generation', icon: 'BoltIcon', description: 'Diesel generators, stationary engines' },
  ];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <PageHero
        title="Heavy Duty Fuel Filters"
        description="Advanced fuel filtration technology for diesel engines. Our heavy duty fuel filters ensure clean fuel delivery and superior engine protection in the most demanding conditions."
      />

      {/* About Fuel Filters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Clean Fuel, Reliable Performance
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Heavy duty fuel filters are critical for protecting diesel fuel systems from contamination. 
                Our advanced multi-stage filtration removes water, particulates, and contaminants to ensure 
                optimal engine performance and longevity in extreme operating conditions.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="BeakerIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Water Separation</h3>
                  <p className="text-gray-600 text-sm">
                    Removes water and moisture to prevent engine damage
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="FunnelIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Multi-Stage Filtration</h3>
                  <p className="text-gray-600 text-sm">
                    Progressive filtration removes particles down to 2 microns
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="ShieldCheckIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">System Protection</h3>
                  <p className="text-gray-600 text-sm">
                    Protects fuel pumps, injectors, and engine components
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="FireIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Cold Weather Performance</h3>
                  <p className="text-gray-600 text-sm">
                    Maintains flow in extreme temperature conditions
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Advanced Filtration Features
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Water Separation Technology:</strong>
                    <span className="text-gray-600 ml-1">99.5% water removal efficiency</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Particulate Filtration:</strong>
                    <span className="text-gray-600 ml-1">Removes debris and contaminants</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Microbial Protection:</strong>
                    <span className="text-gray-600 ml-1">Prevents bacterial and fungal growth</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Heavy-Duty Construction:</strong>
                    <span className="text-gray-600 ml-1">Reinforced housing for extreme conditions</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Fuel Filters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Heavy Duty Fuel Filters
            </h2>
            <p className="text-lg text-gray-600">
              Our most trusted fuel filtration solutions for heavy-duty applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { part: 'HD-FUEL-3001', name: 'Primary Fuel Filter', desc: 'First stage fuel filtration with water separation' },
              { part: 'HD-FUEL-3002', name: 'Secondary Fuel Filter', desc: 'Final stage polishing filter' },
              { part: 'HD-FUEL-3003', name: 'Fuel Water Separator', desc: 'Dedicated water removal system' },
              { part: 'HD-FUEL-3004', name: 'Spin-On Fuel Filter', desc: 'Easy maintenance design' },
              { part: 'HD-FUEL-3005', name: 'In-Line Fuel Filter', desc: 'Compact installation solution' },
              { part: 'HD-FUEL-3006', name: 'Pre-Filter Assembly', desc: 'Preliminary fuel conditioning' },
            ].map((product, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Icon name="BeakerIcon" className="w-16 h-16 text-gray-400" />
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
              Find Your Fuel Filter
            </h2>
            <p className="text-lg text-gray-600">
              Search by part number, equipment model, or find cross-references
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                <Input placeholder="Enter fuel filter part number..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Model</label>
                <Input placeholder="e.g., CAT C15, Cummins ISX..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cross Reference</label>
                <Input placeholder="Competitor part number..." />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-sure-red-500 hover:bg-sure-red-600">
                <Icon name="MagnifyingGlassIcon" className="w-5 h-5 mr-2" />
                Search Fuel Filters
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
              Heavy duty fuel filters for diesel-powered equipment across industries
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

      {/* Why Choose Our Fuel Filters */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Sure Filter® Fuel Filters
            </h2>
            <p className="text-lg text-gray-300">
              Superior fuel system protection and performance you can trust
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="BeakerIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Separation</h3>
              <p className="text-gray-300">
                99.5% water separation efficiency protects your fuel system components.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="FunnelIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Stage Filtration</h3>
              <p className="text-gray-300">
                Progressive filtration ensures the cleanest fuel reaches your engine.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="PhoneIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Technical Support</h3>
              <p className="text-gray-300">
                Expert guidance for fuel system optimization and troubleshooting.
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
