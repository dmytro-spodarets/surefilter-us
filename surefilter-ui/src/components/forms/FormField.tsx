'use client';

import { FormField as FormFieldType } from '@/types/forms';

interface BaseFieldProps {
  field: FormFieldType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

// Shared wrapper for consistent layout
function FieldWrapper({ field, error, children }: { field: FormFieldType; error?: string; children: React.ReactNode }) {
  const isFullWidth = field.type === 'textarea' || field.type === 'checkbox' || field.type === 'radio';
  return (
    <div
      id={`form-field-${field.id}`}
      className={isFullWidth ? 'w-full' : (field.width === 'half' ? 'w-full md:w-[calc(50%-0.5rem)]' : 'w-full')}
    >
      {children}
      {field.helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent transition-colors ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// Text Input Component
export function TextInput({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <Label label={field.label} required={field.required} />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={inputClass(error)}
      />
    </FieldWrapper>
  );
}

// Email Input Component
export function EmailInput({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <Label label={field.label} required={field.required} />
      <input
        type="email"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || 'email@example.com'}
        className={inputClass(error)}
      />
    </FieldWrapper>
  );
}

// Phone Input Component
export function PhoneInput({ field, value, onChange, error }: BaseFieldProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, spaces, dashes, parentheses, and leading +
    const filtered = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '');
    onChange(filtered);
  };

  return (
    <FieldWrapper field={field} error={error}>
      <Label label={field.label} required={field.required} />
      <input
        type="tel"
        value={value || ''}
        onChange={handlePhoneChange}
        placeholder={field.placeholder || '+1 (555) 123-4567'}
        className={inputClass(error)}
      />
    </FieldWrapper>
  );
}

// Textarea Component
export function Textarea({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <Label label={field.label} required={field.required} />
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${inputClass(error)} resize-y`}
      />
    </FieldWrapper>
  );
}

// Select Dropdown Component
export function SelectField({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <Label label={field.label} required={field.required} />
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass(error)}
      >
        <option value="">Select an option...</option>
        {field.options?.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldWrapper>
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
    <FieldWrapper field={field} error={error}>
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
    </FieldWrapper>
  );
}

// Radio Buttons Component
export function RadioField({ field, value, onChange, error }: BaseFieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
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
              className="w-4 h-4 text-sure-blue-600 border-gray-300 focus:ring-sure-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </FieldWrapper>
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
