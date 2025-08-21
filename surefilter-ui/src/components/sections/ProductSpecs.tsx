interface SpecItem {
  label: string;
  value: string | number;
}

interface ProductSpecsProps {
  title?: string;
  left: SpecItem[];
  right: SpecItem[];
  className?: string;
  variant?: 'table' | 'cards';
  contained?: boolean; // wraps with site container when true
}

export default function ProductSpecs({ title = 'Specifications', left, right, className = '', variant = 'cards', contained = true }: ProductSpecsProps) {
  if (variant === 'table') {
    const content = (
      <div className={`rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2">
          <dl className="divide-y divide-gray-200">
            {left.map((item, i) => (
              <div key={`l-${i}`} className="px-6 py-4 grid grid-cols-2">
                <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                <dd className="text-sm text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
          <dl className="divide-y divide-gray-200">
            {right.map((item, i) => (
              <div key={`r-${i}`} className="px-6 py-4 grid grid-cols-2">
                <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                <dd className="text-sm text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );

    if (!contained) return <section className="bg-white">{content}</section>;

    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">{content}</div>
      </section>
    );
  }

  // cards variant (default)
  const items: SpecItem[] = [...left, ...right];
  const content = (
    <>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-500">{item.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">{item.value}</dd>
          </div>
        ))}
      </div>
    </>
  );

  if (!contained) return <section className="bg-white">{content}</section>;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">{content}</div>
    </section>
  );
}
