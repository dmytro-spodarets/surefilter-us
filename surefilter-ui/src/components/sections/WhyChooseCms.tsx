import Icon from '@/components/ui/Icon';

interface Item { icon?: string; title: string; text?: string }

export default function WhyChooseCms({ title, description, items = [] as Item[] }: { title?: string; description?: string; items?: Item[] }) {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          {title && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}

          {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="group text-center p-8 bg-white rounded-xl border border-gray-100 hover:border-sure-blue-200 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sure-blue-50/0 to-sure-red-50/0 group-hover:from-sure-blue-50/30 group-hover:to-sure-red-50/30 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-sure-blue-50 text-sure-blue-500 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300">
                  <Icon name={item.icon || 'CheckCircleIcon'} size="lg" className="w-10 h-10" />
                </div>
              </div>
              <h3 className="relative z-10 text-xl font-semibold text-gray-900 mb-4 group-hover:text-sure-blue-600 transition-colors duration-300">
                {item.title}
              </h3>
              {item.text && (
                <p className="relative z-10 text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {item.text}
                </p>
              )}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-sure-blue-500 to-sure-red-500 group-hover:w-1/2 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


