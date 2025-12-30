import Icon from '@/components/ui/Icon';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface FacilityItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export default function ManufacturingFacilities({ title, description, items = [] as FacilityItem[] }: { title?: string; description?: string; items?: FacilityItem[] }) {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          {title ? (
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{description}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((facility, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <div className="h-48 overflow-hidden relative">
                {facility.image ? (
                  <ManagedImage 
                    src={facility.image} 
                    alt={facility.title} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300" />
                )}
              </div>
              <div className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-sure-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name={facility.icon || 'BuildingOffice2Icon'} className="w-6 h-6 text-sure-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{facility.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{facility.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


