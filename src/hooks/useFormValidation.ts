import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FormField } from '../types/form.types';
import { validateField } from '../utils/validation.utils';
import { setFormError } from '../store/slices/formBuilderSlice';

export const useFormValidation = () => {
  const dispatch = useDispatch();

  const validateFormField = useCallback((field: FormField, value: any) => {
    const error = validateField(field, value);
    dispatch(setFormError({ fieldId: field.id, error: error || '' }));
    return !error;
  }, [dispatch]);

  const validateAllFields = useCallback((fields: FormField[], formData: Record<string, any>) => {
    let isValid = true;
    
    fields.forEach(field => {
      const fieldValue = formData[field.id];
      const isFieldValid = validateFormField(field, fieldValue);
      if (!isFieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }, [validateFormField]);

  return { validateFormField, validateAllFields };
};