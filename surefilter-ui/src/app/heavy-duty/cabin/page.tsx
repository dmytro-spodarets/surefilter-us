import Header from '@/components/layout/Header';
import PageHero from '@/components/sections/PageHero';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

export const metadata = {
  title: 'Heavy Duty Cabin Filters | Sure Filter®',
  description: 'Premium heavy duty cabin air filters for operator comfort and health. Advanced air purification for construction, mining, and industrial equipment.',
};

export default function HeavyDutyCabinFiltersPage() {
  const relatedFilters = [
    { name: 'Air Filters', href: '/heavy-duty/air' },
    { name: 'Oil Filters', href: '/heavy-duty/oil' },
    { name: 'Fuel Filters', href: '/heavy-duty/fuel' },
  ];

  const compatibleIndustries = [
    { name: 'Construction Equipment', icon: 'TruckIcon', description: 'Excavators, loaders, dozers' },
    { name: 'Mining Operations', icon: 'RockingChairIcon', description: 'Mining trucks, draglines' },
    { name: 'Agricultural Machinery', icon: 'HomeModernIcon', description: 'Tractors, combines, sprayers' },
    { name: 'Forestry Equipment', icon: 'TreePineIcon', description: 'Harvesters, skidders, fellers' },
    { name: 'Material Handling', icon: 'CubeIcon', description: 'Forklifts, telehandlers, cranes' },
    { name: 'Road Maintenance', icon: 'MapIcon', description: 'Graders, pavers, sweepers' },
  ];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <PageHero
        title="Heavy Duty Cabin Filters"
        description="Superior air quality protection for equipment operators. Our heavy duty cabin filters provide clean, healthy air in the most challenging work environments."
      />

      {/* About Cabin Filters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Operator Health & Comfort
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Heavy duty cabin filters are essential for protecting equipment operators from dust, 
                pollen, exhaust fumes, and harmful particles. Our advanced filtration technology 
                ensures clean air delivery, reducing fatigue and improving operator productivity 
                in demanding work environments.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="HeartIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Health Protection</h3>
                  <p className="text-gray-600 text-sm">
                    Filters harmful particles, dust, and allergens
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="AdjustmentsHorizontalIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Climate Control</h3>
                  <p className="text-gray-600 text-sm">
                    Maintains HVAC system efficiency and performance
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="UserIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Operator Comfort</h3>
                  <p className="text-gray-600 text-sm">
                    Reduces fatigue and improves working conditions
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Icon name="ClockIcon" className="w-8 h-8 text-sure-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Extended Service Life</h3>
                  <p className="text-gray-600 text-sm">
                    High dust-holding capacity for longer intervals
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Advanced Protection Features
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Multi-Layer Media:</strong>
                    <span className="text-gray-600 ml-1">Progressive filtration for maximum efficiency</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Activated Carbon:</strong>
                    <span className="text-gray-600 ml-1">Absorbs odors and harmful gases</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Electrostatic Media:</strong>
                    <span className="text-gray-600 ml-1">Captures ultrafine particles and allergens</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Icon name="CheckIcon" className="w-5 h-5 text-sure-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">Sealed Construction:</strong>
                    <span className="text-gray-600 ml-1">Prevents bypass and ensures maximum filtration</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cabin Filters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Heavy Duty Cabin Filters
            </h2>
            <p className="text-lg text-gray-600">
              Our most trusted cabin air filtration solutions for heavy equipment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { part: 'HD-CABIN-4001', name: 'Standard Cabin Filter', desc: 'Basic particulate filtration for cab air' },
              { part: 'HD-CABIN-4002', name: 'Carbon Cabin Filter', desc: 'Odor and gas absorption technology' },
              { part: 'HD-CABIN-4003', name: 'HEPA Cabin Filter', desc: 'High-efficiency particulate air filtration' },
              { part: 'HD-CABIN-4004', name: 'Round Cabin Filter', desc: 'Circular design for specific applications' },
              { part: 'HD-CABIN-4005', name: 'Rectangular Cabin Filter', desc: 'Panel-style for larger cab systems' },
              { part: 'HD-CABIN-4006', name: 'Pre-Filter Element', desc: 'First-stage protection for cabin systems' },
            ].map((product, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Icon name="RectangleStackIcon" className="w-16 h-16 text-gray-400" />
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
              Find Your Cabin Filter
            </h2>
            <p className="text-lg text-gray-600">
              Search by part number, equipment model, or find cross-references
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                <Input placeholder="Enter cabin filter part number..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Model</label>
                <Input placeholder="e.g., CAT 320D, Volvo EC480..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cross Reference</label>
                <Input placeholder="Competitor part number..." />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-sure-red-500 hover:bg-sure-red-600">
                <Icon name="MagnifyingGlassIcon" className="w-5 h-5 mr-2" />
                Search Cabin Filters
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
              Heavy duty cabin filters for operator-controlled equipment across industries
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

      {/* Why Choose Our Cabin Filters */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Sure Filter® Cabin Filters
            </h2>
            <p className="text-lg text-gray-300">
              Superior operator protection and comfort you can trust
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="HeartIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Health First</h3>
              <p className="text-gray-300">
                Advanced filtration protects operators from harmful airborne particles.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="UserIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maximum Comfort</h3>
              <p className="text-gray-300">
                Clean air reduces fatigue and improves operator productivity.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="PhoneIcon" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-300">
                Technical assistance for optimal cabin air quality solutions.
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
