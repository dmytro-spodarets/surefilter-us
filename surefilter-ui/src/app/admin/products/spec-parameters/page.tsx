'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SpecParameter {
  id: string;
  code?: string | null;
  name: string;
  unit?: string | null;
  category?: string | null;
  position: number;
  isActive: boolean;
  _count: {
    values: number;
  };
}

export default function SpecParametersPage() {
  const [parameters, setParameters] = useState<SpecParameter[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchParameters();
  }, [search, filterCategory, filterActive]);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterActive !== 'all') params.append('isActive', filterActive);

      const response = await fetch(`/api/admin/spec-parameters?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setParameters(data.parameters);
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch parameters:', data.error);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this parameter?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/spec-parameters/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Parameter deleted successfully');
        fetchParameters();
      } else {
        alert(data.error + (data.details ? '\n\n' + data.details : ''));
      }
    } catch (error) {
      console.error('Error deleting parameter:', error);
      alert('Failed to delete parameter');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const param = parameters.find(p => p.id === id);
      if (!param) return;

      const response = await fetch(`/api/admin/spec-parameters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...param,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchParameters();
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error toggling parameter status:', error);
      alert('Failed to update parameter');
    }
  };

  // Group parameters by category
  const groupedParameters = parameters.reduce((acc, param) => {
    const category = param.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(param);
    return acc;
  }, {} as Record<string, SpecParameter[]>);

  const categoryOrder = ['Dimensions', 'Performance', 'Physical', 'Uncategorized'];
  const sortedCategories = Object.keys(groupedParameters).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Specification Parameters</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage product specification parameters (Height, OD, Thread, etc.)
            </p>
          </div>
          <Link
            href="/admin/products/spec-parameters/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sure-blue-600 hover:bg-sure-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Parameter
          </Link>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sure-blue-500 focus:border-sure-blue-500"
            >
              <option value="all">All Parameters</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parameters by Category */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Loading parameters...
        </div>
      ) : parameters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">No parameters found</p>
          <Link
            href="/admin/products/spec-parameters/new"
            className="text-sure-blue-600 hover:text-sure-blue-700 font-medium"
          >
            Create your first parameter
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map(category => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({groupedParameters[category].length})
                  </span>
                </h3>
              </div>

              {/* Parameters Table */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedParameters[category].map((param) => (
                    <tr key={param.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {param.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {param.code ? (
                          <span className="text-sm text-gray-600 font-mono font-semibold">
                            {param.code}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {param.unit ? (
                          <span className="text-sm text-gray-600">
                            {param.unit}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {param._count.values} {param._count.values === 1 ? 'product' : 'products'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(param.id, param.isActive)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            param.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {param.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/products/spec-parameters/${param.id}`}
                          className="text-sure-blue-600 hover:text-sure-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(param.id)}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && parameters.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {parameters.length} {parameters.length === 1 ? 'parameter' : 'parameters'}
          {' '}across {sortedCategories.length} {sortedCategories.length === 1 ? 'category' : 'categories'}
        </div>
      )}
    </div>
  );
}
