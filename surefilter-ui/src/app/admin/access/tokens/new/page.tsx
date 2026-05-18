'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SCOPES, SCOPE_PRESETS, groupScopes } from '@/mcp/scopes';

type AdminUser = { id: string; email: string; name: string | null };

const RISK_BADGE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function NewTokenPage() {
  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [presetId, setPresetId] = useState<string>('read-only-researcher');
  const [scopes, setScopes] = useState<Set<string>>(new Set());
  const [ttlDays, setTtlDays] = useState<number>(90);
  const [dailyQuota, setDailyQuota] = useState<number>(10000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result after successful creation (plaintext shown once)
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const grouped = useMemo(() => groupScopes(), []);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data: AdminUser[]) => {
        setUsers(data);
        if (data.length > 0 && !ownerId) setOwnerId(data[0].id);
      })
      .catch(() => {});
    // Apply default preset on first render
    applyPreset('read-only-researcher');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPreset(id: string) {
    setPresetId(id);
    const preset = SCOPE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setScopes(new Set(preset.scopes));
  }

  function toggleScope(key: string) {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPresetId('custom');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (scopes.size === 0) {
      setError('Pick at least one scope (or a preset).');
      return;
    }
    if (scopes.has('admin:*')) {
      const ok = confirm(
        'You are creating an admin:* token. This grants every scope including users:* and settings:*. Continue?'
      );
      if (!ok) return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/access/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ownerUserId: ownerId || undefined,
          scopes: Array.from(scopes),
          ttlDays,
          dailyQuota,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Failed to create token');
        return;
      }
      setCreatedName(json.name);
      setPlaintext(json.plaintext);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (plaintext) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Token created</h2>
        <p className="text-sm text-gray-600 mb-4">
          Below is the plaintext for <strong>{createdName}</strong>. It will <strong>not</strong> be shown again
          — copy it now into your client configuration.
        </p>

        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4 text-sm text-amber-900">
          ⚠️ Treat this token like a password. Anyone with it can use the granted scopes until the token is
          revoked or expires.
        </div>

        <div className="bg-gray-900 text-green-200 font-mono text-sm rounded-lg p-4 mb-3 break-all select-all">
          {plaintext}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(plaintext);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="px-4 py-2 bg-sure-blue-600 text-white rounded hover:bg-sure-blue-700 text-sm"
          >
            {copied ? '✓ Copied' : 'Copy token'}
          </button>
          <Link
            href="/admin/access/tokens"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
          >
            Done
          </Link>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <strong className="block mb-2">Quick start (Claude Desktop):</strong>
          <pre className="bg-white border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "surefilter": {
      "url": "https://mcp.surefilter.us/mcp",
      "headers": { "Authorization": "Bearer ${plaintext}" }
    }
  }
}`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Create access token</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-6 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder='e.g. "Claude Desktop — local dev"'
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Visible only in admin UI. Pick something memorable.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                  {u.name ? ` — ${u.name}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Token survives owner deletion (manual revoke required).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires after</label>
            <select
              value={ttlDays}
              onChange={(e) => setTtlDays(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
              <option value={0}>Never</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Defaults from MCP server settings.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily quota</label>
          <input
            type="number"
            min={1}
            max={1_000_000}
            value={dailyQuota}
            onChange={(e) => setDailyQuota(parseInt(e.target.value, 10) || 0)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Max tool calls per UTC day. Returns 429 when exceeded.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preset</label>
          <div className="flex flex-wrap gap-2">
            {SCOPE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  presetId === p.id
                    ? 'bg-sure-blue-50 border-sure-blue-300 text-sure-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                title={p.description}
              >
                {p.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase ${RISK_BADGE[p.risk]}`}>
                  {p.risk}
                </span>
              </button>
            ))}
            <span className="text-xs text-gray-500 self-center ml-2">
              Pick a preset to start, then tweak individual scopes below.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scopes ({scopes.size} selected)</label>
          <div className="space-y-4">
            {(Object.entries(grouped) as Array<[string, typeof SCOPES]>).map(([group, list]) => (
              <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase text-gray-600 tracking-wider">
                  {group}
                </div>
                <div className="divide-y divide-gray-100">
                  {list.map((s) => (
                    <label
                      key={s.key}
                      className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={scopes.has(s.key)}
                        onChange={() => toggleScope(s.key)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono text-gray-900">{s.key}</code>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${RISK_BADGE[s.risk]}`}
                          >
                            {s.risk}
                          </span>
                          {s.public && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-blue-100 text-blue-700">
                              public default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting || !name}
            className="px-5 py-2 bg-sure-blue-600 text-white rounded hover:bg-sure-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? 'Creating…' : 'Create token'}
          </button>
          <Link
            href="/admin/access/tokens"
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
