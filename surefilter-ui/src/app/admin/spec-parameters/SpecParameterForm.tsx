'use client';

import { useState, useEffect } from 'react';

export type SpecParameterInput = {
  name: string;
  unit?: string | null;
  category?: string | null;
  position?: number;
  isActive?: boolean;
};

export default function SpecParameterForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<SpecParameterInput> & { id?: string };
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<SpecParameterInput>(() => ({
    name: initial?.name || '',
    unit: initial?.unit ?? '',
    category: initial?.category ?? '',
    position: (initial?.position as any) ?? 0,
    isActive: initial?.isActive ?? true,
  }));

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: initial?.name || '',
      unit: initial?.unit ?? '',
      category: initial?.category ?? '',
      position: (initial?.position as any) ?? 0,
      isActive: initial?.isActive ?? true,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name,
        unit: (form.unit || '').trim() || null,
        category: (form.category || '').trim() || null,
        position: typeof form.position === 'number' ? Math.trunc(form.position) : 0,
        isActive: !!form.isActive,
      };
      const res = await fetch(mode === 'create' ? '/api/admin/spec-parameters' : `/api/admin/spec-parameters/${initial?.id}` , {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({} as any));
        throw new Error(t?.error || 'Failed to save');
      }
      window.location.href = '/admin/spec-parameters';
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!initial?.id) return;
    if (!confirm('Delete this spec parameter? This cannot be undone.')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/spec-parameters/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const t = await res.json().catch(() => ({} as any));
        throw new Error(t?.error || 'Failed to delete');
      }
      window.location.href = '/admin/spec-parameters';
    } catch (err: any) {
      setError(err?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Unit (optional)</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.unit || ''} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Category (optional)</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Position</label>
          <input type="number" step="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={(form.position as any) ?? 0} onChange={(e) => setForm({ ...form, position: e.target.value === '' ? 0 : Number(e.target.value) })} />
        </div>
        <div className="flex items-end gap-2">
          <input id="active" type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <label htmlFor="active" className="text-sm text-gray-700">Active</label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-2">
        {mode === 'edit' ? (
          <button type="button" onClick={onDelete} className="px-3 py-2 rounded-lg border border-red-300 text-red-700">Delete</button>
        ) : null}
        <button type="submit" className="bg-sure-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? (mode === 'create' ? 'Creating…' : 'Saving…') : (mode === 'create' ? 'Create parameter' : 'Save changes')}</button>
      </div>
    </form>
  );
}
