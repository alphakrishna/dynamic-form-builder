import { FormField } from '../types/form.types';

export const validateField = (field: FormField, value: any): string | null => {
  // FIRST: Check if field is required (independent of validation rules)
  // This ensures ALL required fields are validated regardless of validation rules array
  if (field.required && !field.isDerived) {
    if (isEmpty(value)) {
      return `${field.label} is required`;
    }
  }

  // SECOND: Process all validation rules in field.validations array
  for (const validation of field.validations) {
    switch (validation.type) {
      case 'required':
        if (isEmpty(value)) {
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

/**
 * Helper function to check if a value is considered empty
 * Handles all possible empty states for different field types
 */
const isEmpty = (value: any): boolean => {
  // Handle null, undefined
  if (value === null || value === undefined) {
    return true;
  }
  
  // Handle empty string
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  
  // Handle empty array (for checkbox fields)
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  // Handle number 0 as NOT empty (0 is a valid number)
  if (typeof value === 'number') {
    return false;
  }
  
  // Handle boolean false as NOT empty (false is a valid boolean)
  if (typeof value === 'boolean') {
    return false;
  }
  
  return false;
};