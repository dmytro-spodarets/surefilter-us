'use client';

import { useEffect, useState } from 'react';

type Usage = {
  sinceIso: string;
  totalCalls30d: number;
  statusBreakdown: Record<string, number>;
  topTools: Array<{ tool: string; calls: number }>;
  topTokens: Array<{ tokenId: string; name: string | null; tokenPrefix: string | null; ownerEmail: string | null; calls: number }>;
  timeseries: Array<{ day: string; calls: number }>;
  recent: Array<{
    id: string;
    createdAt: string;
    entityId: string | null;
    entityName: string | null;
    details: any;
    ipAddress: string | null;
  }>;
};

function Sparkline({ points, width = 600, height = 80, color = '#2563eb' }: { points: Array<{ day: string; calls: number }>; width?: number; height?: number; color?: string }) {
  if (points.length === 0) return null;
  const max = Math.max(1, ...points.map((p) => p.calls));
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const padBottom = 16;
  const usable = height - padBottom;
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = usable - (p.calls / max) * usable;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${path} L ${(points.length - 1) * step} ${usable} L 0 ${usable} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <path d={area} fill={color} fillOpacity={0.12} />
      <path d={path} stroke={color} strokeWidth={2} fill="none" />
      {points.map((p, i) => {
        const x = i * step;
        const y = usable - (p.calls / max) * usable;
        return p.calls > 0 ? <circle key={i} cx={x} cy={y} r={2} fill={color} /> : null;
      })}
      <text x={0} y={height - 2} fontSize={10} fill="#6b7280">{points[0].day}</text>
      <text x={width} y={height - 2} fontSize={10} fill="#6b7280" textAnchor="end">{points[points.length - 1].day}</text>
      <text x={width / 2} y={height - 2} fontSize={10} fill="#6b7280" textAnchor="middle">max: {max}/day</text>
    </svg>
  );
}

export default function UsagePage() {
  const [data, setData] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/access/usage')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? 'Failed to load');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message ?? String(e)));
  }, []);

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>;
  }
  if (!data) {
    return <div className="text-gray-400 py-12">Loading…</div>;
  }

  const hasData = data.totalCalls30d > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Usage (last 30 days)</h2>
        <p className="text-sm text-gray-600">
          Aggregated from <code>AdminLog</code> (<code>action=MCP_TOOL_CALL</code>). Charts and per-tool
          drill-down land in Phase 5 once the MCP endpoint produces real traffic.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total tool calls</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{data.totalCalls30d.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Distinct tools</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{data.topTools.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Active tokens</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{data.topTokens.length}</div>
        </div>
      </div>

      {!hasData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          No MCP tool calls recorded yet. Once clients start hitting{' '}
          <code>https://mcp.surefilter.us/mcp</code> with a Bearer token, every authed call is logged here.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Calls per day (last 30)</h3>
        <Sparkline points={data.timeseries} />
      </div>

      {Object.keys(data.statusBreakdown).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.statusBreakdown).map(([status, calls]) => {
              const color =
                status === 'ok' ? 'bg-green-100 text-green-800' :
                status === 'forbidden' ? 'bg-amber-100 text-amber-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-700';
              return (
                <span key={status} className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                  {status}: {calls.toLocaleString()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top tools</h3>
          {data.topTools.length === 0 ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.topTools.map((t) => (
                <li key={t.tool} className="py-2 flex items-center justify-between text-sm">
                  <code className="font-mono text-gray-800">{t.tool ?? '—'}</code>
                  <span className="text-gray-600">{t.calls.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top tokens</h3>
          {data.topTokens.length === 0 ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.topTokens.map((t) => (
                <li key={t.tokenId} className="py-2 flex items-center justify-between text-sm gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 truncate">{t.name ?? <span className="italic text-gray-400">unknown</span>}</div>
                    <div className="text-xs font-mono text-gray-500">
                      {t.tokenPrefix ? `${t.tokenPrefix}…` : t.tokenId.slice(0, 10)}
                      {t.ownerEmail && <> · {t.ownerEmail}</>}
                    </div>
                  </div>
                  <span className="text-gray-600 font-medium">{t.calls.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent calls (25)</h3>
        {data.recent.length === 0 ? (
          <p className="text-sm text-gray-500">No recent calls.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="py-1 pr-2">When</th>
                <th className="py-1 pr-2">Tool</th>
                <th className="py-1 pr-2">Token</th>
                <th className="py-1 pr-2">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recent.map((c) => (
                <tr key={c.id}>
                  <td className="py-1 pr-2 text-gray-700">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="py-1 pr-2 font-mono">{c.details?.tool ?? '—'}</td>
                  <td className="py-1 pr-2 font-mono text-xs">{c.entityId ?? '—'}</td>
                  <td className="py-1 pr-2 text-gray-500">{c.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
