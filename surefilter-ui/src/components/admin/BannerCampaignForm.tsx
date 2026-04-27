'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  campaignId?: string;
  initialData?: any;
}

export default function BannerCampaignForm({ campaignId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PAUSED' | 'ARCHIVED',
    notifyEmail: '',
  });

  useEffect(() => {
    if (!initialData) return;
    setForm({
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      status: initialData.status || 'ACTIVE',
      notifyEmail: initialData.notifyEmail || '',
    });
  }, [initialData]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      status: form.status,
      notifyEmail: form.notifyEmail || null,
    };

    try {
      const url = campaignId ? `/api/admin/banner-campaigns/${campaignId}` : '/api/admin/banner-campaigns';
      const method = campaignId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Failed to save');
        return;
      }
      router.push('/admin/banner-campaigns');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Summer 2026 Promo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
        <input
          required
          value={form.slug}
          onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
          placeholder="summer-2026-promo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => set('status', e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default notify email</label>
        <input
          type="email"
          value={form.notifyEmail}
          onChange={(e) => set('notifyEmail', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="leads@yourcompany.com"
        />
        <p className="text-xs text-gray-500 mt-1">Banners in this campaign will use this address as fallback if their own notify email is empty.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-sure-blue-600 text-white rounded-lg font-medium disabled:opacity-60">
          {saving ? 'Saving…' : campaignId ? 'Save changes' : 'Create campaign'}
        </button>
        <button type="button" onClick={() => router.push('/admin/banner-campaigns')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
