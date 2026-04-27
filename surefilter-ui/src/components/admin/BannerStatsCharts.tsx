'use client';

interface SeriesPoint {
  day: string;
  count: number;
}

interface TimeSeriesChartProps {
  title: string;
  data: SeriesPoint[];
  color?: string;
  height?: number;
}

/** Lightweight SVG bar chart — no dependencies. */
export function TimeSeriesChart({ title, data, color = '#1D2475', height = 160 }: TimeSeriesChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="text-xs text-gray-500 tabular-nums">Total: {total.toLocaleString()}</div>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No data in last 30 days</div>
      ) : (
        <div className="flex items-end gap-1" style={{ height }}>
          {data.map((d) => {
            const h = (d.count / max) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full rounded-t transition-opacity hover:opacity-80"
                  style={{ height: `${h}%`, minHeight: d.count > 0 ? 2 : 0, backgroundColor: color }}
                />
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {d.day}: {d.count.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface BreakdownListProps {
  title: string;
  data: Array<{ key: string; count: number }>;
}

export function BreakdownList({ title, data }: BreakdownListProps) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {data.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">No data</div>
      ) : (
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <div className="flex-1 truncate text-sm text-gray-700" title={d.key}>{d.key}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-sure-blue-600" style={{ width: `${(d.count / max) * 100}%` }} />
              </div>
              <div className="text-sm tabular-nums text-gray-600 w-12 text-right">{d.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  hint?: string;
  color?: 'blue' | 'green' | 'purple';
}

export function StatCard({ label, value, hint, color = 'blue' }: StatCardProps) {
  const colors = {
    blue: 'bg-sure-blue-50 text-sure-blue-700 border-sure-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  } as const;
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1 tabular-nums">{value.toLocaleString()}</div>
      {hint && <div className="text-xs mt-1 opacity-70">{hint}</div>}
    </div>
  );
}
