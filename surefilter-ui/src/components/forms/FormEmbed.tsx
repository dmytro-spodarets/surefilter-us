'use client';

import DynamicForm from './DynamicForm';

interface FormEmbedProps {
  formId?: string;
  formSlug?: string;
  title?: string;
  description?: string;
  className?: string;
  onSuccess?: (submissionId: string, data?: any) => void;
  onError?: (error: string) => void;
  additionalData?: Record<string, any>;
}

export default function FormEmbed({
  formId,
  formSlug,
  title,
  description,
  className = '',
  onSuccess,
  onError,
  additionalData,
}: FormEmbedProps) {
  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <DynamicForm
        formId={formId}
        formSlug={formSlug}
        onSuccess={onSuccess}
        onError={onError}
        additionalData={additionalData}
      />
    </div>
  );
}

