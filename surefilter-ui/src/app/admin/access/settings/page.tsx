'use client';

import { useEffect, useState } from 'react';

type Settings = {
  enabled: boolean;
  publicScopesEnabled: boolean;
  defaultTokenTtlDays: number;
  defaultDailyQuota: number;
  rateLimitPerMinute: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

const DEFAULTS: Settings = {
  enabled: true,
  publicScopesEnabled: true,
  defaultTokenTtlDays: 90,
  defaultDailyQuota: 10000,
  rateLimitPerMinute: 120,
  maintenanceMode: false,
  maintenanceMessage: 'MCP server is temporarily unavailable for maintenance.',
};

export default function McpSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/access/settings')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? 'Failed to load');
        return r.json();
      })
      .then(setSettings)
      .catch((e) => setError(e.message ?? String(e)));
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/access/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? 'Failed to save');
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">MCP server settings</h2>
        <p className="text-sm text-gray-600">
          Global toggles for <code>mcp.surefilter.us</code>. Stored in <code>SiteSettings.mcp</code>.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-2xl">
        <Toggle
          label="MCP server enabled"
          description="Master switch. When off, the server responds 503 to every request."
          value={settings.enabled}
          onChange={(v) => update('enabled', v)}
        />
        <Toggle
          label="Public scopes (no token) enabled"
          description="When off, anonymous (no-token) requests are rejected. Public catalog/content/cms read becomes token-gated."
          value={settings.publicScopesEnabled}
          onChange={(v) => update('publicScopesEnabled', v)}
        />
        <Toggle
          label="Maintenance mode"
          description="When on, the server responds with the message below."
          value={settings.maintenanceMode}
          onChange={(v) => update('maintenanceMode', v)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance message</label>
          <textarea
            value={settings.maintenanceMessage}
            onChange={(e) => update('maintenanceMessage', e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-gray-900">Defaults</h3>
        <NumberField
          label="Default token TTL (days)"
          description="0 = never expires. Applied when admins don't override on token creation."
          value={settings.defaultTokenTtlDays}
          min={0}
          max={3650}
          onChange={(v) => update('defaultTokenTtlDays', v)}
        />
        <NumberField
          label="Default daily quota"
          description="Max tool calls per UTC day per token (override per-token in token detail)."
          value={settings.defaultDailyQuota}
          min={1}
          max={1_000_000}
          onChange={(v) => update('defaultDailyQuota', v)}
        />
        <NumberField
          label="Rate-limit (per token per minute)"
          description="Burst protection. 429 returned when exceeded."
          value={settings.rateLimitPerMinute}
          min={1}
          max={10000}
          onChange={(v) => update('rateLimitPerMinute', v)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-sure-blue-600 text-white rounded hover:bg-sure-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="text-green-700 text-sm">✓ Saved</span>}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-8">Connection guide</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use these snippets after creating a token. Replace <code>YOUR_TOKEN</code> with the plaintext from the
          token-creation modal.
        </p>

        <div className="space-y-4 max-w-3xl">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">Claude Desktop</div>
            <p className="text-xs text-gray-600 mb-2">
              Add to <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or{' '}
              <code>%APPDATA%\Claude\claude_desktop_config.json</code> (Windows):
            </p>
            <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "surefilter": {
      "url": "https://mcp.surefilter.us/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" }
    }
  }
}`}
            </pre>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">Claude Code (CLI)</div>
            <p className="text-xs text-gray-600 mb-2">Add a project-level <code>.mcp.json</code> or use the user-level config:</p>
            <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{`claude mcp add --transport http surefilter \\
  https://mcp.surefilter.us/mcp \\
  --header "Authorization: Bearer YOUR_TOKEN"`}
            </pre>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">curl smoke test</div>
            <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{`curl -i -X POST https://mcp.surefilter.us/mcp \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",
       "params":{"protocolVersion":"2025-11-25",
                 "capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
    </label>
  );
}

function NumberField({
  label,
  description,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  );
}
