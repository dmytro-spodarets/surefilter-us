'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  ProductShowcaseConfig,
  ProductShowcaseCrossRef,
  ProductShowcaseItem,
} from '@/components/banners/layouts/product-showcase-schema';

const MAX_PRODUCTS = 2;

interface AdminProduct {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  media?: Array<{ asset: { cdnUrl: string } }>;
}

interface BannerProductShowcaseTabProps {
  config: ProductShowcaseConfig;
  onChange: (next: ProductShowcaseConfig) => void;
}

export default function BannerProductShowcaseTab({ config, onChange }: BannerProductShowcaseTabProps) {
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, AdminProduct>>({});
  const [search, setSearch] = useState('');
  const [pickingForSlot, setPickingForSlot] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/products?limit=200')
      .then((r) => r.json())
      .then((d) => setAllProducts(Array.isArray(d.products) ? d.products : []))
      .catch(() => undefined);
  }, []);

  // Load full details for selected products (to populate description fallback, image preview)
  useEffect(() => {
    const ids = config.products.map((p) => p.productId).filter(Boolean);
    if (ids.length === 0) {
      setSelectedProducts({});
      return;
    }
    fetch(`/api/admin/products?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, AdminProduct> = {};
        for (const p of d.products || []) map[p.id] = p;
        setSelectedProducts(map);
      })
      .catch(() => undefined);
  }, [config.products.map((p) => p.productId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<ProductShowcaseConfig>) => onChange({ ...config, ...patch });

  const updateItem = (index: number, patch: Partial<ProductShowcaseItem>) => {
    const products = [...config.products];
    products[index] = { ...products[index], ...patch };
    update({ products });
  };

  const setSlotProduct = (slot: number, productId: string) => {
    const products = [...config.products];
    while (products.length <= slot) products.push({ productId: '' });
    products[slot] = { ...products[slot], productId };
    update({ products });
    setPickingForSlot(null);
    setSearch('');
  };

  const clearSlot = (slot: number) => {
    const products = [...config.products];
    products[slot] = { productId: '' };
    update({ products });
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProducts.slice(0, 50);
    return allProducts
      .filter((p) => p.code.toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q))
      .slice(0, 50);
  }, [allProducts, search]);

  // Ensure we always render exactly MAX_PRODUCTS slots in UI
  const slots: ProductShowcaseItem[] = Array.from({ length: MAX_PRODUCTS }, (_, i) => config.products[i] || { productId: '' });

  return (
    <div className="space-y-6">
      {/* Header / overlay */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Header overlay</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Headline accent word</label>
            <input
              value={config.overlayHeadlineAccent || ''}
              onChange={(e) => update({ overlayHeadlineAccent: e.target.value })}
              placeholder="FORKLIFTS"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-gray-500 mt-1">Rendered in orange.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Headline rest</label>
            <input
              value={config.overlayHeadlineRest || ''}
              onChange={(e) => update({ overlayHeadlineRest: e.target.value })}
              placeholder="Air Filters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            value={config.overlaySubtitle || ''}
            onChange={(e) => update({ overlaySubtitle: e.target.value })}
            placeholder="Top sellers and this month's special offer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* Visibility toggles */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Card sections to show</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
          {([
            ['showImage', 'Image'],
            ['showApplication', 'Application'],
            ['showCrossRefs', 'Cross refs'],
            ['showMoqCont', 'MOQ / CONT'],
            ['showPrice', 'Price'],
          ] as const).map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={config[key]}
                onChange={(e) => update({ [key]: e.target.checked } as Partial<ProductShowcaseConfig>)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Product slots */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Products ({MAX_PRODUCTS} slots)</h3>

        {slots.map((item, slot) => {
          const product = selectedProducts[item.productId];
          return (
            <div key={slot} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Product #{slot + 1}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickingForSlot(pickingForSlot === slot ? null : slot)}
                    className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {pickingForSlot === slot ? 'Cancel' : item.productId ? 'Replace' : 'Pick product'}
                  </button>
                  {item.productId && (
                    <button
                      type="button"
                      onClick={() => clearSlot(slot)}
                      className="text-xs px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {pickingForSlot === slot && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Search by code or name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 text-center">No products</p>
                    ) : (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSlotProduct(slot, p.id)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 text-left"
                        >
                          <img
                            src={p.media?.[0]?.asset?.cdnUrl || '/images/placeholder-product.jpg'}
                            alt=""
                            className="w-10 h-10 object-contain bg-white rounded border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{p.code}</p>
                            <p className="text-xs text-gray-500 truncate">{p.name || p.description || '—'}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {item.productId && (
                <>
                  <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                    <img
                      src={product?.media?.[0]?.asset?.cdnUrl || '/images/placeholder-product.jpg'}
                      alt=""
                      className="w-12 h-12 object-contain bg-white rounded border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{product?.code || item.productId}</p>
                      <p className="text-xs text-gray-500 truncate">{product?.name || product?.description || ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateItem(slot, { description: e.target.value })}
                        rows={2}
                        placeholder={product?.description || 'Air Filter Set Metal End Cap Element With Sleeve'}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Application / Fits</label>
                      <input
                        value={item.applicationText || ''}
                        onChange={(e) => updateItem(slot, { applicationText: e.target.value })}
                        placeholder="Forklifts: Bobcat, Toyota"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">MOQ</label>
                      <input
                        value={item.moq || ''}
                        onChange={(e) => updateItem(slot, { moq: e.target.value })}
                        placeholder="1 case"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">CONT</label>
                      <input
                        value={item.cont || ''}
                        onChange={(e) => updateItem(slot, { cont: e.target.value })}
                        placeholder="9"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (each)</label>
                      <input
                        value={item.priceText || ''}
                        onChange={(e) => updateItem(slot, { priceText: e.target.value })}
                        placeholder="$19.86 each"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (per case)</label>
                      <input
                        value={item.pricePerCaseText || ''}
                        onChange={(e) => updateItem(slot, { pricePerCaseText: e.target.value })}
                        placeholder="$178.74 per CASE"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Special badge (empty = none)</label>
                      <input
                        value={item.specialBadge || ''}
                        onChange={(e) => updateItem(slot, { specialBadge: e.target.value })}
                        placeholder="SPECIAL"
                        className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">When set, this card's price is shown in red and a SPECIAL ribbon appears top-right.</p>
                    </div>
                  </div>

                  <CrossRefsEditor
                    crossRefs={item.crossRefs || []}
                    onChange={(crossRefs) => updateItem(slot, { crossRefs })}
                  />
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Footer</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Stock text</label>
          <input
            value={config.footerStockText || ''}
            onChange={(e) => update({ footerStockText: e.target.value })}
            placeholder="36 forklift filters in stock"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Brands text</label>
          <input
            value={config.footerBrandsText || ''}
            onChange={(e) => update({ footerBrandsText: e.target.value })}
            placeholder="Bobcat · Toyota · Hyster · Clark · Caterpillar & more"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <p className="text-[11px] text-gray-500">
          The footer button/email field comes from the banner Type (CTA → button using <strong>CTA label/URL</strong> from the Content tab; Lead Capture → email form using <strong>Lead Capture</strong> tab fields).
        </p>
      </section>
    </div>
  );
}

function CrossRefsEditor({
  crossRefs,
  onChange,
}: {
  crossRefs: ProductShowcaseCrossRef[];
  onChange: (next: ProductShowcaseCrossRef[]) => void;
}) {
  const add = () => onChange([...crossRefs, { brand: '', codes: '' }]);
  const remove = (i: number) => onChange(crossRefs.filter((_, idx) => idx !== i));
  const setRow = (i: number, patch: Partial<ProductShowcaseCrossRef>) => {
    const next = [...crossRefs];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium text-gray-700">Cross references</label>
        <button
          type="button"
          onClick={add}
          disabled={crossRefs.length >= 6}
          className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          + Add row
        </button>
      </div>
      {crossRefs.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No cross references. Add rows like &quot;Baldwin · PA1667FN; PA2489&quot;.</p>
      ) : (
        <div className="space-y-2">
          {crossRefs.map((row, i) => (
            <div key={i} className="grid grid-cols-[110px_1fr_auto] gap-2 items-center">
              <input
                value={row.brand}
                onChange={(e) => setRow(i, { brand: e.target.value })}
                placeholder="Baldwin"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <input
                value={row.codes}
                onChange={(e) => setRow(i, { codes: e.target.value })}
                placeholder="PA1667FN; PA2489"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                aria-label="Remove row"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
