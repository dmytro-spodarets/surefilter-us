import Icon from '@/components/ui/Icon';

interface StatItem { icon: string; value: string; label: string }

export default function StatsBand({ title, subtitle, items = [] as StatItem[] }: { title: string; subtitle?: string; items?: StatItem[] }) {
  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-sure-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">{title}</h2>
          {subtitle ? <p className="text-sm sm:text-lg text-sure-blue-100 max-w-3xl mx-auto">{subtitle}</p> : null}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
          {items.map((it, idx) => (
            <div key={idx} className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-16 sm:h-16 mb-2 sm:mb-4 flex items-center justify-center">
                  <Icon name={it.icon} className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">{it.value}</div>
                <div className="text-sure-blue-100 font-medium text-xs sm:text-base lg:text-lg">{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


