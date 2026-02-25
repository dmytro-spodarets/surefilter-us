import Icon from '@/components/ui/Icon';

interface Item { icon?: string; title: string; text?: string }

export default function WhyChooseCms({ title, description, items = [] as Item[] }: { title?: string; description?: string; items?: Item[] }) {
  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-6 md:mb-12">
          {title && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
          {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>

        <div className="flex flex-col md:flex-wrap md:flex-row md:justify-center gap-3 md:gap-8">
          {items.map((item, index) => (
            <div key={index} className="group flex md:flex-col items-start md:items-center md:text-center p-4 md:p-8 bg-white rounded-xl border border-gray-100 hover:border-sure-blue-200 transition-all duration-300 md:hover:-translate-y-2 relative overflow-hidden w-full md:w-[calc(33.333%-1.33rem)] md:max-w-[350px]">
              <div className="absolute inset-0 bg-gradient-to-br from-sure-blue-50/0 to-sure-red-50/0 group-hover:from-sure-blue-50/30 group-hover:to-sure-red-50/30 transition-all duration-300"></div>
              <div className="relative z-10 shrink-0 inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-sure-blue-50 text-sure-blue-500 rounded-xl md:rounded-2xl md:mb-6 group-hover:scale-110 transition-all duration-300">
                <Icon name={item.icon || 'CheckCircleIcon'} size="md" className="w-6 h-6 md:w-10 md:h-10" />
              </div>
              <div className="relative z-10 ml-4 md:ml-0 min-w-0">
                <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-1 md:mb-4 group-hover:text-sure-blue-600 transition-colors duration-300">
                  {item.title}
                </h3>
                {item.text && (
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {item.text}
                  </p>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-sure-blue-500 to-sure-red-500 group-hover:w-1/2 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


