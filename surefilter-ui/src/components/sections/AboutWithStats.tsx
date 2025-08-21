import Icon from '@/components/ui/Icon';

interface Feature {
  icon: string;
  text: string;
}

interface Stat {
  icon: string;
  title: string;
  subtitle: string;
}

interface AboutWithStatsProps {
  title: string;
  description: string;
  features: Feature[];
  stats: Stat[];
  className?: string;
}

export default function AboutWithStats({ 
  title,
  description,
  features,
  stats,
  className = ""
}: AboutWithStatsProps) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {description}
            </p>
            <ul className="space-y-3 text-gray-600">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Icon name={feature.icon} className="w-5 h-5 text-sure-red-500 mr-3" />
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Quality & Certification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-100">
                  <Icon name={stat.icon} className="w-8 h-8 text-sure-blue-500 mb-2" />
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{stat.title}</h4>
                  <p className="text-xs text-gray-600">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
