'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

type TokenRow = {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  ownerEmail: string | null;
  ownerName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
  dailyQuota: number;
  requestCountToday: number;
  status: 'active' | 'expired' | 'revoked';
};

function StatusBadge({ status }: { status: TokenRow['status'] }) {
  const map: Record<TokenRow['status'], string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-yellow-100 text-yellow-800',
    revoked: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}

function ScopeChips({ scopes }: { scopes: string[] }) {
  if (scopes.includes('admin:*')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
        admin:*
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {scopes.slice(0, 4).map((s) => (
        <span
          key={s}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-800"
        >
          {s}
        </span>
      ))}
      {scopes.length > 4 && (
        <span className="text-xs text-gray-500">+{scopes.length - 4} more</span>
      )}
    </div>
  );
}

export default function TokensListPage() {
  const [tokens, setTokens] = useState<TokenRow[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [filter]);

  async function load() {
    setError(null);
    setTokens(null);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/access/tokens?${params.toString()}`);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load');
      const json = await res.json();
      setTokens(json.tokens);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  async function revokeToken(id: string, name: string) {
    const reason = prompt(`Revoke token "${name}"? Optional reason:`);
    if (reason === null) return;
    try {
      const res = await fetch(`/api/admin/access/tokens/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error ?? 'Failed to revoke');
        return;
      }
      void load();
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-900">Personal Access Tokens</h2>
        <Link
          href="/admin/settings/tokens/new"
          className="inline-flex items-center px-4 py-2 bg-sure-blue-600 text-white rounded-lg hover:bg-sure-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New token
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(['all', 'active', 'expired', 'revoked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-sure-blue-50 border-sure-blue-200 text-sure-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search by name or prefix…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load();
          }}
          className="ml-auto px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64"
        />
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scopes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last used
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tokens === null && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {tokens && tokens.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No tokens yet. Click <strong>New token</strong> to create your first one.
                </td>
              </tr>
            )}
            {tokens?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  <div className="text-xs font-mono text-gray-500">{t.tokenPrefix}…</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {t.ownerEmail ?? <span className="italic text-gray-400">deleted</span>}
                </td>
                <td className="px-4 py-3">
                  <ScopeChips scopes={t.scopes} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : <span className="text-gray-400">never</span>}
                  {t.lastUsedIp && <div className="text-xs text-gray-500">{t.lastUsedIp}</div>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : <span className="text-gray-400">never</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/admin/settings/tokens/${t.id}`} className="text-sure-blue-600 hover:text-sure-blue-800 mr-3">
                    View
                  </Link>
                  {t.status === 'active' && (
                    <button
                      onClick={() => revokeToken(t.id, t.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
