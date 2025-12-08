'use client';

import { useState, useEffect } from 'react';
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterTypes, setFilterTypes] = useState([]);
  const [specParameters, setSpecParameters] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [brandsRes, categoriesRes, filterTypesRes, specParamsRes] = await Promise.all([
        fetch('/api/admin/brands?isActive=true'),
        fetch('/api/admin/categories?isActive=true'),
        fetch('/api/admin/product-filter-types'),
        fetch('/api/admin/spec-parameters?isActive=true'),
      ]);

      const [brandsData, categoriesData, filterTypesData, specParamsData] = await Promise.all([
        brandsRes.json(),
        categoriesRes.json(),
        filterTypesRes.json(),
        specParamsRes.json(),
      ]);

      setBrands(brandsData.brands || []);
      setCategories(categoriesData.categories || []);
      setFilterTypes(filterTypesData || []);
      setSpecParameters(specParamsData.parameters || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center text-gray-500">Loading form data...</div>
      </div>
    );
  }

  return (
    <ProductForm
      mode="create"
      brands={brands}
      categories={categories}
      filterTypes={filterTypes}
      specParameters={specParameters}
    />
  );
}
