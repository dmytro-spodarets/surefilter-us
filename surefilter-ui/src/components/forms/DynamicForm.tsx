'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import FormField from './FormField';
import { FormField as FormFieldType } from '@/types/forms';

interface DynamicFormProps {
  formId?: string;
  formSlug?: string;
  onSuccess?: (submissionId: string, data?: any) => void;
  onError?: (error: string) => void;
  additionalData?: Record<string, any>;
  className?: string;
}

interface FormConfig {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'DOWNLOAD' | 'CONTACT';
  fields: FormFieldType[];
  successTitle?: string;
  successMessage?: string;
  redirectUrl?: string;
}

export default function DynamicForm({
  formId,
  formSlug,
  onSuccess,
  onError,
  additionalData,
  className = '',
}: DynamicFormProps) {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load form configuration
  useEffect(() => {
    loadFormConfig();
  }, [formId, formSlug]);

  const loadFormConfig = async () => {
    try {
      setLoading(true);
      
      if (!formSlug && !formId) {
        throw new Error('Either formId or formSlug must be provided');
      }

      // Use different endpoints for slug vs id
      const url = formSlug 
        ? `/api/forms/${formSlug}` 
        : `/api/forms/by-id/${formId}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Form not found');
      }

      const data = await response.json();
      setFormConfig(data);
    } catch (error: any) {
      console.error('Error loading form:', error);
      setSubmitError(error.message || 'Failed to load form');
      if (onError) {
        onError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formConfig) return false;

    formConfig.fields.forEach((field) => {
      const value = formData[field.id];

      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.id] = `${field.label} is required`;
        return;
      }

      // Skip further validation if field is empty and not required
      if (!value) return;

      // Email validation
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }

      // Phone validation
      if (field.type === 'phone') {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
          newErrors[field.id] = 'Please enter a valid phone number';
        }
      }

      // Text/Textarea validation
      if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          newErrors[field.id] = `Must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.id] = `Must be no more than ${field.validation.maxLength} characters`;
        }
        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          newErrors[field.id] = 'Invalid format';
        }
      }

      // Checkbox validation (at least one selected if required)
      if (field.type === 'checkbox' && field.required) {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[field.id] = 'Please select at least one option';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formConfig) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: formConfig.id,
          data: formData,
          additionalData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      setSubmitted(true);

      // Redirect if configured
      if (formConfig.redirectUrl) {
        window.location.href = formConfig.redirectUrl;
        return;
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result.submissionId, result);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to submit form');
      if (onError) {
        onError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle field value change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (submitError && !formConfig) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-red-800 font-medium">Failed to load form</p>
        <p className="text-red-600 text-sm mt-1">{submitError}</p>
      </div>
    );
  }

  // Success state
  if (submitted && formConfig) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-8 text-center ${className}`}>
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {formConfig.successTitle || 'Thank You!'}
        </h3>
        <p className="text-gray-700">
          {formConfig.successMessage || 'Your form has been submitted successfully.'}
        </p>
      </div>
    );
  }

  // Form not found
  if (!formConfig) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <p className="text-gray-600">Form not found</p>
      </div>
    );
  }

  // Render form
  return (
    <div className={className}>
      {formConfig.description && (
        <p className="text-gray-600 mb-6">{formConfig.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields */}
        <div className="flex flex-wrap gap-4">
          {formConfig.fields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              error={errors[field.id]}
            />
          ))}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-sure-blue-600 hover:bg-sure-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {formConfig.type === 'DOWNLOAD' ? 'Processing...' : 'Submitting...'}
              </span>
            ) : (
              formConfig.type === 'DOWNLOAD' ? 'Download' : 'Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

