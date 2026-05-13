'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
  position: number;
  isActive: boolean;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    resources: number;
    children: number;
  };
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  position: number;
  isActive: boolean;
  parentId: string;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  color: '',
  image: '',
  position: 0,
  isActive: true,
  parentId: '',
};

export default function ResourceCategoriesPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/resource-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editing
        ? `/api/admin/resource-categories/${editing}`
        : '/api/admin/resource-categories';
      const method = editing ? 'PUT' : 'POST';

      const payload = {
        ...form,
        parentId: form.parentId || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      alert(editing ? 'Category updated successfully' : 'Category created successfully');
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.message);
    }
  };

  const handleEdit = (category: ResourceCategory) => {
    setEditing(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
      image: category.image || '',
      position: category.position,
      isActive: category.isActive,
      parentId: category.parentId || '',
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/admin/resource-categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }
      alert('Category deleted');
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Parent options: only top-level categories that aren't the category being edited
  // (and that don't already have a parent — enforced by API too)
  const parentOptions = categories.filter(
    (cat) => !cat.parentId && cat.id !== editing
  );

  // Group categories: top-level first, with their children nested below
  const topLevel = categories.filter((cat) => !cat.parentId);
  const childrenByParent = categories
    .filter((cat) => cat.parentId)
    .reduce<Record<string, ResourceCategory[]>>((acc, cat) => {
      const key = cat.parentId as string;
      (acc[key] = acc[key] || []).push(cat);
      return acc;
    }, {});

  // Categories that have at least one child cannot themselves become children
  const hasChildren = editing
    ? (categories.find((c) => c.id === editing)?._count.children ?? 0) > 0
    : false;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Categories</h1>
            <p className="text-gray-600 mt-1">Manage categories and subcategories for your resources</p>
          </div>
          <Link
            href="/admin/resources"
            className="bg-sure-blue-600 hover:bg-sure-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View Resources
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const newSlug = !editing ? generateSlug(newName) : form.slug;
                    setForm({ ...form, name: newName, slug: newSlug });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:outline-none"
                  placeholder="e.g., Product Catalogs, Forklifts"
                  autoFocus={!editing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:outline-none"
                  pattern="[a-z0-9-]+"
                  placeholder="e.g., product-catalogs, forklifts"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase + dashes only.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:outline-none"
                  disabled={hasChildren}
                >
                  <option value="">— None (top-level category)</option>
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {hasChildren
                    ? 'This category already has subcategories, so it must stay top-level.'
                    : 'Leave empty to make this a top-level category.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (for subcategory cards)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:outline-none"
                    placeholder="S3 key like images/categories/forklifts.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Browse
                  </button>
                </div>
                {form.image && (
                  <div className="mt-2 relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <ManagedImage src={form.image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (HeroIcon name)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  placeholder="DocumentTextIcon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color (Tailwind)</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  placeholder="bg-blue-100 text-blue-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  min="0"
                />
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded focus:ring-sure-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-sure-blue-600 hover:bg-sure-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List grouped by parent */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          ) : topLevel.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No categories yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first category using the form</p>
            </div>
          ) : (
            <div className="space-y-6">
              {topLevel.map((category) => {
                const children = childrenByParent[category.id] || [];
                return (
                  <div key={category.id} className="bg-white rounded-lg shadow">
                    <CategoryRow category={category} onEdit={handleEdit} onDelete={handleDelete} />
                    {children.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 space-y-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                          Subcategories
                        </div>
                        {children.map((child) => (
                          <CategoryRow
                            key={child.id}
                            category={child}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isChild
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showImagePicker && (
        <MediaPickerModal
          isOpen={showImagePicker}
          onSelect={(s3Key) => {
            setForm({ ...form, image: s3Key });
            setShowImagePicker(false);
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
  isChild = false,
}: {
  category: ResourceCategory;
  onEdit: (c: ResourceCategory) => void;
  onDelete: (id: string, name: string) => void;
  isChild?: boolean;
}) {
  return (
    <div className={`p-6 flex items-start justify-between ${isChild ? 'py-3' : ''}`}>
      <div className="flex items-start gap-4 flex-1">
        {category.image && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <ManagedImage src={category.image} alt={category.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`font-bold text-gray-900 ${isChild ? 'text-base' : 'text-lg'}`}>
              {category.name}
            </h3>
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-500">pos: {category.position}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <code className="bg-gray-100 px-2 py-0.5 rounded">{category.slug}</code>
            <span>Resources: {category._count.resources}</span>
            {!isChild && category._count.children > 0 && (
              <span>Subcategories: {category._count.children}</span>
            )}
          </div>
          {category.description && (
            <p className="text-gray-600 mt-2 text-sm">{category.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 ml-4 flex-shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="text-sure-blue-600 hover:text-sure-blue-700 font-medium text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id, category.name)}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
