'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  code: string;
  name?: string | null;
  status?: string | null;
  brand: {
    id: string;
    name: string;
    code?: string | null;
  };
  categories: Array<{
    isPrimary: boolean;
    category: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    specValues: number;
    media: number;
    crossReferences: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [search, brandFilter, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (brandFilter) params.append('brandId', brandFilter);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryCategory = (product: Product) => {
    const primary = product.categories?.find(c => c.isPrimary);
    return primary?.category.name || product.categories?.[0]?.category.name || '—';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your product catalog
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sure-blue-600 hover:bg-sure-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">Admin</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Products</span>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or manufacturer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setBrandFilter('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-gray-500 mb-4">No products found</p>
            <Link
              href="/admin/products/new"
              className="text-sure-blue-600 hover:text-sure-blue-700 font-medium"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.code}
                      </div>
                      {product.name && (
                        <div className="text-sm text-gray-500">
                          {product.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.brand.name}
                    </div>
                    {product.brand.code && (
                      <div className="text-xs text-gray-500 font-mono">
                        {product.brand.code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPrimaryCategory(product)}
                    </div>
                    {product.categories && product.categories.length > 1 && (
                      <div className="text-xs text-gray-500">
                        +{product.categories.length - 1} more
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'Discontinued'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-3">
                      <span title="Specifications">
                        📋 {product._count?.specValues || 0}
                      </span>
                      <span title="Images">
                        🖼️ {product._count?.media || 0}
                      </span>
                      <span title="Cross References">
                        🔗 {product._count?.crossReferences || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sure-blue-600 hover:text-sure-blue-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {!loading && products.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </div>
      )}
    </div>
  );
}
