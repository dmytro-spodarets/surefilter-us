'use client';

import { useState, useEffect } from 'react';
import type { FeaturedProductsCatalogInput } from '@/cms/schemas';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  media: Array<{
    asset: {
      cdnUrl: string;
    };
  }>;
  categories: Array<{
    category: {
      name: string;
    };
  }>;
}

export default function FeaturedProductsCatalogForm({ 
  sectionId, 
  initialData 
}: { 
  sectionId: string; 
  initialData: FeaturedProductsCatalogInput 
}) {
  const [form, setForm] = useState<FeaturedProductsCatalogInput>({
    title: initialData.title || 'Featured Products',
    description: initialData.description || '',
    fallbackHref: initialData.fallbackHref || '/catalog',
    productIds: Array.isArray(initialData.productIds) ? initialData.productIds : [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load all products
  useEffect(() => {
    loadProducts();
  }, []);

  // Load selected products details
  useEffect(() => {
    if (form.productIds.length > 0) {
      loadSelectedProducts();
    } else {
      setSelectedProducts([]);
    }
  }, [form.productIds]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Загружаем больше продуктов для поиска
      const res = await fetch('/api/admin/products?limit=200');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedProducts = async () => {
    try {
      const res = await fetch(`/api/admin/products?ids=${form.productIds.join(',')}`);
      const data = await res.json();
      setSelectedProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load selected products:', error);
    }
  };

  const addProduct = (productId: string) => {
    if (!form.productIds.includes(productId)) {
      setForm({ ...form, productIds: [...form.productIds, productId] });
    }
  };

  const removeProduct = (productId: string) => {
    setForm({ ...form, productIds: form.productIds.filter(id => id !== productId) });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newIds = [...form.productIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setForm({ ...form, productIds: newIds });
  };

  const moveDown = (index: number) => {
    if (index === form.productIds.length - 1) return;
    const newIds = [...form.productIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    setForm({ ...form, productIds: newIds });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'featured_products_catalog', data: form }),
    });
    setSaving(false);
    setSaved(true);
  };

  const filteredProducts = products.filter(p => 
    !form.productIds.includes(p.id) && (
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getProductImage = (product: Product) => {
    return product.media?.[0]?.asset?.cdnUrl || '/images/placeholder-product.jpg';
  };

  const getProductCategory = (product: Product) => {
    return product.categories?.[0]?.category?.name || 'Uncategorized';
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Featured Products (Catalog)</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.title || ''} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Fallback link</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              value={form.fallbackHref || ''} 
              onChange={(e) => setForm({ ...form, fallbackHref: e.target.value })} 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg px-3 py-2" 
            rows={2} 
            value={form.description || ''} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
          />
        </div>

        {/* Selected Products */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Selected Products ({form.productIds.length})</h3>
          
          {selectedProducts.length > 0 ? (
            <div className="space-y-2">
              {selectedProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    className="w-16 h-16 object-contain bg-white rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.code}</p>
                    <p className="text-sm text-gray-600">{product.name}</p>
                    <p className="text-xs text-gray-500">{getProductCategory(product)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === selectedProducts.length - 1}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No products selected</p>
          )}
        </div>

        {/* Product Picker */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Add Products</h3>
          
          <input
            type="text"
            placeholder="Search by part number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
                <p className="text-sm text-gray-500">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredProducts.length > 0 ? (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name} 
                        className="w-12 h-12 object-contain bg-white rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.code}</p>
                        <p className="text-sm text-gray-600">{product.name}</p>
                        <p className="text-xs text-gray-500">{getProductCategory(product)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addProduct(product.id)}
                        className="px-3 py-1 text-sm bg-sure-blue-600 text-white rounded hover:bg-sure-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-gray-500 text-center">No products found</p>
              )}
            </div>
          )}
        </div>

        <div>
          <button 
            type="submit" 
            className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
