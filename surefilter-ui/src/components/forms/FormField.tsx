'use client';

import { FormField as FormFieldType } from '@/types/forms';

interface BaseFieldProps {
  field: FormFieldType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

// Text Input Component
export function TextInput({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <div className={`${field.width === 'half' ? 'w-full md:w-[calc(50%-0.5rem)]' : 'w-full'}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
        pattern={field.validation?.pattern}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Email Input Component
export function EmailInput({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <div className={`${field.width === 'half' ? 'w-full md:w-[calc(50%-0.5rem)]' : 'w-full'}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="email"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Phone Input Component
export function PhoneInput({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <div className={`${field.width === 'half' ? 'w-full md:w-[calc(50%-0.5rem)]' : 'w-full'}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="tel"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Textarea Component
export function Textarea({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
        rows={4}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent transition-colors resize-y ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Select Dropdown Component
export function SelectField({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <div className={`${field.width === 'half' ? 'w-full md:w-[calc(50%-0.5rem)]' : 'w-full'}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select an option...</option>
        {field.options?.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Checkbox Component
export function CheckboxField({ field, value, onChange, error }: BaseFieldProps) {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, option]);
    } else {
      onChange(selectedValues.filter((v: string) => v !== option));
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {field.options?.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
              className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded focus:ring-sure-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Radio Buttons Component
export function RadioField({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {field.options?.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              required={field.required}
              className="w-4 h-4 text-sure-blue-600 border-gray-300 focus:ring-sure-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

// Main FormField Component (renders appropriate field based on type)
export default function FormField({ field, value, onChange, error }: BaseFieldProps) {
  switch (field.type) {
    case 'text':
      return <TextInput field={field} value={value} onChange={onChange} error={error} />;
    case 'email':
      return <EmailInput field={field} value={value} onChange={onChange} error={error} />;
    case 'phone':
      return <PhoneInput field={field} value={value} onChange={onChange} error={error} />;
    case 'textarea':
      return <Textarea field={field} value={value} onChange={onChange} error={error} />;
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} error={error} />;
    case 'checkbox':
      return <CheckboxField field={field} value={value} onChange={onChange} error={error} />;
    case 'radio':
      return <RadioField field={field} value={value} onChange={onChange} error={error} />;
    default:
      return null;
  }
}

