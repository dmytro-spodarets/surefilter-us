import { SCOPES, SCOPE_PRESETS, groupScopes } from '@/mcp/scopes';
import { MCP_TOOLS, toolsForScope } from '@/mcp/tools-registry';

const RISK_BADGE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function ScopesReferencePage() {
  const grouped = groupScopes();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Scopes Reference</h2>
        <p className="text-sm text-gray-600">
          Every scope, with the MCP tools it unlocks. Use this page when deciding which scopes to grant a new
          token. The catalog of {MCP_TOOLS.length} tools below grows as Phase 1–3 are implemented — entries
          marked as not-yet-wired will start working once the corresponding tool handlers ship.
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {SCOPE_PRESETS.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{p.label}</h4>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${RISK_BADGE[p.risk]}`}>
                  {p.risk}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {p.scopes.map((s) => (
                  <code key={s} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                    {s}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">All scopes</h3>
        <div className="space-y-6">
          {(Object.entries(grouped) as Array<[string, typeof SCOPES]>).map(([group, list]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">{group}</h4>
              <div className="space-y-3">
                {list.map((s) => {
                  const tools = toolsForScope(s.key);
                  return (
                    <div key={s.key} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <code className="text-sm font-mono text-gray-900 font-semibold">{s.key}</code>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${RISK_BADGE[s.risk]}`}>
                          {s.risk}
                        </span>
                        {s.public && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-blue-100 text-blue-700">
                            public default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{s.description}</p>
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-900">
                          Unlocks {tools.length} tool{tools.length === 1 ? '' : 's'}
                        </summary>
                        <ul className="mt-2 space-y-1 pl-4 list-disc">
                          {tools.length === 0 && <li className="italic">No tools registered yet.</li>}
                          {tools.map((t) => (
                            <li key={t.name}>
                              <code className="font-mono">{t.name}</code>
                              {t.destructive && (
                                <span className="ml-2 px-1 py-0.5 rounded text-[10px] uppercase bg-red-100 text-red-700">
                                  destructive
                                </span>
                              )}
                              {t.mutating && !t.destructive && (
                                <span className="ml-2 px-1 py-0.5 rounded text-[10px] uppercase bg-yellow-100 text-yellow-700">
                                  mutating
                                </span>
                              )}
                              <div className="text-gray-500">{t.description}</div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
