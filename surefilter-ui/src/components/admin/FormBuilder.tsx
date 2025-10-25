'use client';

import { useState } from 'react';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  width: 'full' | 'half';
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface FormData {
  name: string;
  slug: string;
  description?: string;
  fields: FormField[];
  successTitle?: string;
  successMessage?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  notifyEmail?: string;
  isActive: boolean;
}

interface FormBuilderProps {
  initialData?: Partial<FormData>;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const FIELD_TYPES: Array<{ value: FormField['type']; label: string }> = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email Input' },
  { value: 'phone', label: 'Phone Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
];

export default function FormBuilder({ initialData, onSave, onCancel }: FormBuilderProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    fields: initialData?.fields || [],
    successTitle: initialData?.successTitle || 'Thank You!',
    successMessage: initialData?.successMessage || 'Your form has been submitted successfully.',
    redirectUrl: initialData?.redirectUrl || '',
    webhookUrl: initialData?.webhookUrl || '',
    webhookHeaders: initialData?.webhookHeaders || {},
    notifyEmail: initialData?.notifyEmail || '',
    isActive: initialData?.isActive ?? true,
  });

  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'integrations'>('fields');
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!initialData?.slug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, name, slug }));
    }
  };

  // Add new field
  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      helpText: '',
      width: 'full',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined,
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setEditingFieldIndex(formData.fields.length);
  };

  // Update field
  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  // Delete field
  const deleteField = (index: number) => {
    if (confirm('Are you sure you want to delete this field?')) {
      const newFields = formData.fields.filter((_, i) => i !== index);
      setFormData({ ...formData, fields: newFields });
      setEditingFieldIndex(null);
    }
  };

  // Move field up/down
  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFormData({ ...formData, fields: newFields });
    setEditingFieldIndex(targetIndex);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      alert('Name and slug are required');
      return;
    }

    if (formData.fields.length === 0) {
      alert('Please add at least one field to the form');
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
              placeholder="Contact Form"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
              placeholder="contact-form"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Brief description of this form"
            />
          </div>

          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded focus:ring-sure-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active (form can receive submissions)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'fields'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Form Fields ({formData.fields.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'settings'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Success Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'integrations'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Integrations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Field Types Sidebar */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Add Field</h3>
                <div className="space-y-2">
                  {FIELD_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => addField(value)}
                      className="w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields List & Editor */}
              <div className="lg:col-span-2">
                {formData.fields.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No fields added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click a field type on the left to add it</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.fields.map((field, index) => (
                      <div
                        key={field.id}
                        className={`border rounded-lg ${
                          editingFieldIndex === index
                            ? 'border-sure-blue-500 bg-sure-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* Field Preview */}
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setEditingFieldIndex(editingFieldIndex === index ? null : index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-gray-400">#{index + 1}</span>
                              <span className="text-sm font-medium text-gray-900">{field.label}</span>
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{field.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
                                disabled={index === formData.fields.length - 1}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deleteField(index); }}
                                className="text-red-500 hover:text-red-700"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Field Editor */}
                        {editingFieldIndex === index && (
                          <div className="border-t border-gray-200 p-4 bg-white space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Label *</label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sure-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Placeholder</label>
                                <input
                                  type="text"
                                  value={field.placeholder}
                                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sure-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Help Text</label>
                              <input
                                type="text"
                                value={field.helpText}
                                onChange={(e) => updateField(index, { helpText: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-sure-blue-500"
                                placeholder="Additional instructions for the user"
                              />
                            </div>

                            <div className="flex gap-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => updateField(index, { required: e.target.checked })}
                                  className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-xs text-gray-700">Required</span>
                              </label>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-700">Width:</span>
                                <select
                                  value={field.width}
                                  onChange={(e) => updateField(index, { width: e.target.value as 'full' | 'half' })}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="full">Full</option>
                                  <option value="half">Half</option>
                                </select>
                              </div>
                            </div>

                            {/* Options for select/radio/checkbox */}
                            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                                {field.options?.map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(field.options || [])];
                                        newOptions[optIndex] = e.target.value;
                                        updateField(index, { options: newOptions });
                                      }}
                                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOptions = field.options?.filter((_, i) => i !== optIndex);
                                        updateField(index, { options: newOptions });
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                    updateField(index, { options: newOptions });
                                  }}
                                  className="text-sm text-sure-blue-600 hover:text-sure-blue-700"
                                >
                                  + Add Option
                                </button>
                              </div>
                            )}

                            {/* Validation for text fields */}
                            {(field.type === 'text' || field.type === 'textarea') && (
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Length</label>
                                  <input
                                    type="number"
                                    value={field.validation?.minLength || ''}
                                    onChange={(e) => updateField(index, {
                                      validation: { ...field.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                                    })}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Length</label>
                                  <input
                                    type="number"
                                    value={field.validation?.maxLength || ''}
                                    onChange={(e) => updateField(index, {
                                      validation: { ...field.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                                    })}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                                    min="0"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Success Title</label>
                <input
                  type="text"
                  value={formData.successTitle}
                  onChange={(e) => setFormData({ ...formData, successTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  placeholder="Thank You!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
                <textarea
                  value={formData.successMessage}
                  onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  rows={3}
                  placeholder="Your form has been submitted successfully."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL (Optional)</label>
                <input
                  type="url"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-xs text-gray-500 mt-1">Redirect user to this URL after successful submission</p>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Webhook Integration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                    <input
                      type="url"
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      placeholder="https://your-webhook-endpoint.com/submit"
                    />
                    <p className="text-xs text-gray-500 mt-1">POST request will be sent to this URL with form data</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Email Notifications</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
                  <input
                    type="email"
                    value={formData.notifyEmail}
                    onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    placeholder="admin@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Receive email when someone submits this form</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </form>
  );
}

