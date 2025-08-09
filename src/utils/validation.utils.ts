import { FormField } from '../types/form.types';

export const validateField = (field: FormField, value: any): string | null => {
  for (const validation of field.validations) {
    switch (validation.type) {
      case 'required':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return validation.message;
        }
        break;
      case 'minLength':
        if (value && value.length < (validation.value as number)) {
          return validation.message;
        }
        break;
      case 'maxLength':
        if (value && value.length > (validation.value as number)) {
          return validation.message;
        }
        break;
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          return validation.message;
        }
        break;
      case 'password':
        if (value && (value.length < 8 || !/\d/.test(value))) {
          return validation.message;
        }
        break;
    }
  }
  return null;
};