export default function AboutNewsCms({
  aboutTitle,
  aboutParagraphs = [],
  stats = [] as { number: string; label: string }[],
  aboutCtaLabel = 'Learn More About Us',
  aboutCtaHref = '#',
  newsTitle,
  newsItems = [] as { title: string; date: string; category: string; href?: string }[],
  newsCtaLabel = 'See All News',
  newsCtaHref = '#',
}: {
  aboutTitle?: string;
  aboutParagraphs?: string[];
  stats?: { number: string; label: string }[];
  aboutCtaLabel?: string;
  aboutCtaHref?: string;
  newsTitle?: string;
  newsItems?: { title: string; date: string; category: string; href?: string }[];
  newsCtaLabel?: string;
  newsCtaHref?: string;
}) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-sure-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{aboutTitle}</h2>
            {aboutParagraphs.map((p, i) => (
              <p key={i} className={`text-${i === 0 ? 'lg' : 'base'} text-gray-600 leading-relaxed ${i === 0 ? 'mb-6' : 'mb-8'}`}>
                {p}
              </p>
            ))}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-sure-blue-600 mb-1">{s.number}</div>
                    <div className="text-xs text-gray-600 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-auto">
              <a href={aboutCtaHref} className="px-8 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-600 transition-colors duration-200">
                {aboutCtaLabel}
              </a>
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{newsTitle}</h2>
            <div className="space-y-6 mb-8">
              {newsItems.map((n, i) => (
                <div key={i} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {n.title}
                    </h3>
                    <span className="text-sm text-gray-500 ml-4">{n.date}</span>
                  </div>
                  <span className="inline-block px-2 py-1 bg-sure-blue-100 text-sure-blue-600 text-xs font-medium rounded-full">{n.category}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <a href={newsCtaHref} className="px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200">
                {newsCtaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


