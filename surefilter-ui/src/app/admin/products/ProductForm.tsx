'use client';

import { useEffect, useMemo, useState } from 'react';

type FilterTypeOption = { id: string; name: string; category: 'HEAVY_DUTY' | 'AUTOMOTIVE'; fullSlug: string };
type SpecParameterOption = { id: string; name: string; unit?: string | null; category?: string | null; position: number; isActive: boolean };

type ProductInput = {
  code: string;
  name: string;
  description?: string | null;
  category?: 'HEAVY_DUTY' | 'AUTOMOTIVE' | null;
  filterTypeId?: string | null;
  status?: string | null;
  images: Array<{ src: string; alt?: string }>;
  specsLeft: Array<{ label: string; value: string }>;
  specsRight: Array<{ label: string; value: string }>;
  oems: Array<{ number: string; manufacturer?: string }>;
  tags: string[];
  manufacturer?: string | null;
  industries: string[];
  heightMm?: number | null;
  odMm?: number | null;
  idMm?: number | null;
  thread?: string | null;
  model?: string | null;
  specValues?: Array<{ parameterId: string; value: string; unitOverride?: string | null; position?: number }>;
};

export default function ProductForm({
  mode,
  initial,
  filterTypes,
  specParameters,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<ProductInput> & { id?: string };
  filterTypes: FilterTypeOption[];
  specParameters: SpecParameterOption[];
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductInput>(() => ({
    code: initial?.code || '',
    name: initial?.name || '',
    description: initial?.description ?? '',
    category: (initial?.category as any) || null,
    filterTypeId: (initial?.filterTypeId as any) || null,
    status: initial?.status ?? '',
    images: (initial?.images as any) || [],
    specsLeft: (initial?.specsLeft as any) || [],
    specsRight: (initial?.specsRight as any) || [],
    oems: (initial?.oems as any) || [],
    tags: initial?.tags || [],
    manufacturer: initial?.manufacturer ?? '',
    industries: initial?.industries || [],
    heightMm: (initial?.heightMm as any) ?? null,
    odMm: (initial?.odMm as any) ?? null,
    idMm: (initial?.idMm as any) ?? null,
    thread: initial?.thread ?? '',
    model: initial?.model ?? '',
    specValues: (initial?.specValues as any) || [],
  }));

  useEffect(() => {
    // If initial changes (client nav), sync form
    setForm((prev) => ({
      ...prev,
      ...initial,
      code: initial?.code || '',
      name: initial?.name || '',
      description: initial?.description ?? '',
      category: (initial?.category as any) || null,
      filterTypeId: (initial?.filterTypeId as any) || null,
      status: initial?.status ?? '',
      images: (initial?.images as any) || [],
      specsLeft: (initial?.specsLeft as any) || [],
      specsRight: (initial?.specsRight as any) || [],
      oems: (initial?.oems as any) || [],
      tags: initial?.tags || [],
      manufacturer: initial?.manufacturer ?? '',
      industries: initial?.industries || [],
      heightMm: (initial?.heightMm as any) ?? null,
      odMm: (initial?.odMm as any) ?? null,
      idMm: (initial?.idMm as any) ?? null,
      thread: initial?.thread ?? '',
      model: initial?.model ?? '',
      specValues: (initial?.specValues as any) || [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const filterTypesByCategory = useMemo(() => ({
    HEAVY_DUTY: filterTypes.filter((f) => f.category === 'HEAVY_DUTY'),
    AUTOMOTIVE: filterTypes.filter((f) => f.category === 'AUTOMOTIVE'),
  }), [filterTypes]);

  const specById = useMemo(() => {
    const m = new Map<string, SpecParameterOption>();
    (specParameters || []).forEach((p) => m.set(p.id, p));
    return m;
  }, [specParameters]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: any = {
      ...form,
      description: form.description || null,
      category: form.category || null,
      filterTypeId: form.filterTypeId || null,
      status: form.status || null,
      manufacturer: form.manufacturer || null,
      thread: form.thread || null,
      model: form.model || null,
      heightMm: form.heightMm === null || form.heightMm === undefined || form.heightMm === ('' as any) ? null : Number(form.heightMm),
      odMm: form.odMm === null || form.odMm === undefined || form.odMm === ('' as any) ? null : Number(form.odMm),
      idMm: form.idMm === null || form.idMm === undefined || form.idMm === ('' as any) ? null : Number(form.idMm),
      specValues: (form.specValues || []).map((sv) => ({
        parameterId: sv.parameterId,
        value: sv.value,
        unitOverride: (sv.unitOverride || '') === '' ? null : sv.unitOverride,
        position: typeof sv.position === 'number' ? Math.trunc(sv.position) : 0,
      })),
    };

    try {
      const res = await fetch(mode === 'create' ? '/api/admin/products' : `/api/admin/products/${initial?.id}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({} as any));
        throw new Error(t?.error || 'Failed to save');
      }
      window.location.href = '/admin/products';
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!initial?.id) return;
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const t = await res.json().catch(() => ({} as any));
        throw new Error(t?.error || 'Failed to delete');
      }
      window.location.href = '/admin/products';
    } catch (err: any) {
      setError(err?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const setJson = (key: keyof ProductInput, value: string) => {
    try {
      const parsed = value.trim() ? JSON.parse(value) : [];
      setForm((f) => ({ ...f, [key]: parsed } as any));
      setError(null);
    } catch (e) {
      setError('Invalid JSON in one of JSON fields');
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Code</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Category</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.category || ''} onChange={(e) => setForm({ ...form, category: (e.target.value || null) as any, filterTypeId: null })}>
            <option value="">—</option>
            <option value="HEAVY_DUTY">Heavy Duty</option>
            <option value="AUTOMOTIVE">Automotive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Filter Type</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.filterTypeId || ''} onChange={(e) => setForm({ ...form, filterTypeId: e.target.value || null })}>
            <option value="">—</option>
            {(form.category ? filterTypesByCategory[form.category] : filterTypes).map((ft) => (
              <option key={ft.id} value={ft.id}>{ft.name} ({ft.category})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Status</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g., Release Product" value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Manufacturer</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.manufacturer || ''} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Model</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Thread</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.thread || ''} onChange={(e) => setForm({ ...form, thread: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Height (mm)</label>
          <input type="number" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={(form.heightMm as any) ?? ''} onChange={(e) => setForm({ ...form, heightMm: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">OD (mm)</label>
          <input type="number" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={(form.odMm as any) ?? ''} onChange={(e) => setForm({ ...form, odMm: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">ID (mm)</label>
          <input type="number" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={(form.idMm as any) ?? ''} onChange={(e) => setForm({ ...form, idMm: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Tags (comma-separated)</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={(form.tags || []).join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Industries (comma-separated)</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={(form.industries || []).join(', ')} onChange={(e) => setForm({ ...form, industries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Images (JSON array)</label>
          <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={JSON.stringify(form.images || [], null, 2)} onChange={(e) => setJson('images', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Specs Left (JSON array)</label>
          <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={JSON.stringify(form.specsLeft || [], null, 2)} onChange={(e) => setJson('specsLeft', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Specs Right (JSON array)</label>
          <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={JSON.stringify(form.specsRight || [], null, 2)} onChange={(e) => setJson('specsRight', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">OEMs (JSON array)</label>
          <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={JSON.stringify(form.oems || [], null, 2)} onChange={(e) => setJson('oems', e.target.value)} />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-gray-900">Specifications</h2>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm"
            onClick={() =>
              setForm((f) => ({
                ...f,
                specValues: [...(f.specValues || []), { parameterId: specParameters[0]?.id || '', value: '', unitOverride: '', position: (f.specValues?.length || 0) * 10 }],
              }))
            }
          >
            + Add spec
          </button>
        </div>

        <div className="grid gap-3">
          {(form.specValues || []).map((sv, idx) => {
            const p = specById.get(sv.parameterId || '');
            return (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border border-gray-200 rounded-lg p-3">
                <div className="md:col-span-4">
                  <label className="block text-sm text-gray-700 mb-1">Parameter</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={sv.parameterId || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => {
                        const next = [...(f.specValues || [])];
                        next[idx] = { ...next[idx], parameterId: v } as any;
                        return { ...f, specValues: next } as any;
                      });
                    }}
                  >
                    <option value="">— Select parameter —</option>
                    {specParameters.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}{sp.unit ? ` (${sp.unit})` : ''}{sp.category ? ` — ${sp.category}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm text-gray-700 mb-1">Value</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={sv.value || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => {
                        const next = [...(f.specValues || [])];
                        next[idx] = { ...next[idx], value: v } as any;
                        return { ...f, specValues: next } as any;
                      });
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Unit override</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder={p?.unit || ''}
                    value={sv.unitOverride || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => {
                        const next = [...(f.specValues || [])];
                        next[idx] = { ...next[idx], unitOverride: v } as any;
                        return { ...f, specValues: next } as any;
                      });
                    }}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-700 mb-1">Pos</label>
                  <input
                    type="number"
                    step="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={(sv.position as any) ?? 0}
                    onChange={(e) => {
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setForm((f) => {
                        const next = [...(f.specValues || [])];
                        next[idx] = { ...next[idx], position: v } as any;
                        return { ...f, specValues: next } as any;
                      });
                    }}
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        specValues: (f.specValues || []).filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          {(form.specValues || []).length === 0 && (
            <p className="text-sm text-gray-600">No specifications added yet.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-2">
        {mode === 'edit' ? (
          <button type="button" onClick={onDelete} className="px-3 py-2 rounded-lg border border-red-300 text-red-700">Delete</button>
        ) : null}
        <button type="submit" className="bg-sure-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={saving}>{saving ? (mode === 'create' ? 'Creating…' : 'Saving…') : (mode === 'create' ? 'Create product' : 'Save changes')}</button>
      </div>
    </form>
  );
}
