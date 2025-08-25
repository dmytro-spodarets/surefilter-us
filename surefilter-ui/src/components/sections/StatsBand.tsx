import Icon from '@/components/ui/Icon';

interface StatItem { icon: string; value: string; label: string }

export default function StatsBand({ title, subtitle, items = [] as StatItem[] }: { title: string; subtitle?: string; items?: StatItem[] }) {
  return (
    <section className="py-16 sm:py-24 bg-sure-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          {subtitle ? <p className="text-lg text-sure-blue-100 max-w-3xl mx-auto">{subtitle}</p> : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {items.map((it, idx) => (
            <div key={idx} className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <Icon name={it.icon} className="w-12 h-12 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">{it.value}</div>
                <div className="text-sure-blue-100 font-medium text-lg">{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


