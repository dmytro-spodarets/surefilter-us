// Form field types
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

// Form data structure
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

// Form from API
export interface Form extends FormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submissions: number;
    resources: number;
  };
}

// Form submission
export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  webhookSent: boolean;
  webhookError?: string;
  webhookResponse?: any;
  webhookAttempts: number;
  lastWebhookTry?: string;
  emailSent: boolean;
  emailError?: string;
  createdAt: string;
  form?: {
    id: string;
    name: string;
    slug: string;
    fields?: FormField[];
  };
}

