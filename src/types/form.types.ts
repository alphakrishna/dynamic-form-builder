export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number | string;
  message: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validations: ValidationRule[];
  isDerived?: boolean;
  parentFields?: string[];
  derivationFormula?: string;
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

export interface FormBuilderState {
  savedForms: FormSchema[];
  currentForm: FormSchema | null;
  previewForm: FormSchema | null;
  formData: Record<string, any>;
  formErrors: Record<string, string>;
}