'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TokenDetail = {
  token: {
    id: string;
    name: string;
    tokenPrefix: string;
    scopes: string[];
    userId: string | null;
    createdAt: string;
    lastUsedAt: string | null;
    lastUsedIp: string | null;
    expiresAt: string | null;
    revokedAt: string | null;
    revokedReason: string | null;
    requestCountToday: number;
    dailyQuota: number;
    user: { id: string; email: string; name: string | null } | null;
  };
  revokedBy: { id: string; email: string; name: string | null } | null;
  recentCalls: Array<{ id: string; createdAt: string; entityName: string | null; details: any; ipAddress: string | null }>;
};

export default function TokenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<TokenDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [regenResult, setRegenResult] = useState<{ plaintext: string; name: string } | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setError(null);
    try {
      const res = await fetch(`/api/admin/access/tokens/${id}`);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load');
      const json: TokenDetail = await res.json();
      setData(json);
      setNewName(json.token.name);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  async function saveName() {
    if (!data || newName === data.token.name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/access/tokens/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error ?? 'Failed to save');
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function revoke() {
    if (!data) return;
    const reason = prompt(`Revoke token "${data.token.name}"? Optional reason:`);
    if (reason === null) return;
    const res = await fetch(`/api/admin/access/tokens/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || undefined }),
    });
    if (!res.ok) {
      alert((await res.json()).error ?? 'Failed to revoke');
      return;
    }
    await load();
  }

  async function regenerate() {
    if (!data) return;
    const ok = confirm(
      `Regenerate token "${data.token.name}"? The current token will be immediately revoked and a new plaintext will be shown ONCE.`
    );
    if (!ok) return;
    const res = await fetch(`/api/admin/access/tokens/${id}/regenerate`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? 'Failed to regenerate');
      return;
    }
    setRegenResult({ plaintext: json.plaintext, name: json.name });
    // Navigate to the new token detail after closing the modal
    setTimeout(() => router.push(`/admin/access/tokens/${json.id}`), 0);
  }

  if (regenResult) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Token regenerated</h2>
        <p className="text-sm text-gray-600 mb-4">
          New plaintext for <strong>{regenResult.name}</strong> — copy now, it will not be shown again.
        </p>
        <div className="bg-gray-900 text-green-200 font-mono text-sm rounded-lg p-4 mb-4 break-all select-all">
          {regenResult.plaintext}
        </div>
        <Link
          href="/admin/access/tokens"
          className="px-4 py-2 bg-sure-blue-600 text-white rounded hover:bg-sure-blue-700 text-sm"
        >
          Done
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error} <Link href="/admin/access/tokens" className="underline ml-2">Back to list</Link>
      </div>
    );
  }
  if (!data) {
    return <div className="text-gray-400 py-12">Loading…</div>;
  }

  const t = data.token;
  const isActive = !t.revokedAt && (!t.expiresAt || new Date(t.expiresAt).getTime() > Date.now());

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/access/tokens" className="text-sm text-sure-blue-600 hover:underline">
          ← All tokens
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={saveName}
              disabled={!isActive || saving}
              className="text-xl font-bold text-gray-900 bg-transparent border-b border-transparent focus:border-gray-300 outline-none w-full disabled:opacity-50"
            />
            <div className="text-xs font-mono text-gray-500 mt-1">{t.tokenPrefix}…</div>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <>
                <button
                  onClick={regenerate}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                >
                  Regenerate
                </button>
                <button
                  onClick={revoke}
                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Revoke
                </button>
              </>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Owner</dt>
            <dd className="text-gray-900">{t.user?.email ?? <span className="italic text-gray-400">deleted user</span>}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="text-gray-900">{new Date(t.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Last used</dt>
            <dd className="text-gray-900">
              {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : <span className="text-gray-400">never</span>}
              {t.lastUsedIp && <span className="text-xs text-gray-500 ml-2">{t.lastUsedIp}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Expires</dt>
            <dd className="text-gray-900">
              {t.expiresAt ? new Date(t.expiresAt).toLocaleString() : <span className="text-gray-400">never</span>}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Quota today</dt>
            <dd className="text-gray-900">
              {t.requestCountToday} / {t.dailyQuota}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd>
              {t.revokedAt ? (
                <span className="text-red-700">
                  Revoked {new Date(t.revokedAt).toLocaleString()}
                  {t.revokedReason && <> · {t.revokedReason}</>}
                  {data.revokedBy && <> · by {data.revokedBy.email}</>}
                </span>
              ) : t.expiresAt && new Date(t.expiresAt).getTime() <= Date.now() ? (
                <span className="text-yellow-700">Expired</span>
              ) : (
                <span className="text-green-700">Active</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <dt className="text-gray-500 text-sm mb-2">Scopes</dt>
          <div className="flex flex-wrap gap-1.5">
            {t.scopes.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-800">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent tool calls (last 50)</h3>
        {data.recentCalls.length === 0 ? (
          <p className="text-sm text-gray-500">
            No MCP tool calls recorded yet. (Tool execution starts in Phase 1; this list will populate after the
            MCP server endpoint is wired up.)
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 text-sm">
            {data.recentCalls.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between">
                <span className="font-mono text-gray-700">{(c.details as any)?.tool ?? c.entityName ?? '—'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                  {c.ipAddress && <> · {c.ipAddress}</>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
