import { CheckCircleIcon, ShieldCheckIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface Metric {
  text: string;
  size: 'small' | 'medium' | 'large';
  image?: string;
}

interface IndustryShowcaseProps {
  industryTitle: string;
  industryDescription: string;
  brandPromise: string;
  keyFeatures: string[];
  metrics: Metric[];
}

export default function IndustryShowcase({
  industryTitle,
  industryDescription,
  brandPromise,
  keyFeatures,
  metrics,
}: IndustryShowcaseProps) {
  
  // Функция для определения размера карточки в grid
  const getGridSize = (size: Metric['size']) => {
    switch (size) {
      case 'large':
        return 'col-span-1 md:col-span-2 row-span-2 min-h-[400px]'; // большая квадратная
      case 'medium':
        return 'col-span-1 md:col-span-2 row-span-1 min-h-[200px]'; // широкая
      case 'small':
      default:
        return 'col-span-1 row-span-1 min-h-[150px]'; // обычная, низкая
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Верхняя секция: Industry Definition + Brand Promise */}
        <div className="grid lg:grid-cols-5 gap-12 mb-12">
          
          {/* Левая колонка - Industry Definition (60%) */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {industryTitle}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {industryDescription}
            </p>
          </div>

          {/* Правая колонка - Brand Promise (40%) */}
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-8">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {brandPromise}
            </p>
            
            {/* Key Features */}
            <ul className="space-y-3">
              {keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-sure-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя секция: Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-auto">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`
                ${getGridSize(metric.size)}
                bg-white rounded-lg overflow-hidden border border-gray-200
                flex flex-col
              `}
            >
              {metric.image && (
                <div className="w-full bg-gray-50 flex-shrink-0">
                  <ManagedImage 
                    src={metric.image} 
                    alt={metric.text}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex items-center justify-center text-center">
                <p className={`
                  text-gray-800 leading-relaxed font-semibold
                  ${metric.size === 'large' ? 'text-lg' : 'text-base'}
                `}>
                  {metric.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
