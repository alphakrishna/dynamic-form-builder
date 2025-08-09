import { FormField } from '../types/form.types';

export const calculateDerivedValue = (
  field: FormField, 
  formData: Record<string, any>
): any => {
  if (!field.isDerived || !field.parentFields || !field.derivationFormula) {
    return '';
  }

  try {
    let formula = field.derivationFormula;
    
    // Replace parent field IDs with their actual values
    field.parentFields.forEach(parentId => {
      const parentValue = formData[parentId] || '';
      formula = formula.replace(new RegExp(`\\b${parentId}\\b`, 'g'), parentValue.toString());
    });

    // Handle special functions
    if (formula.includes('calculateAge')) {
      const dateMatch = formula.match(/calculateAge\(([^)]+)\)/);
      if (dateMatch) {
        const dateValue = dateMatch[1].replace(/['"]/g, ''); // Remove quotes
        if (dateValue && dateValue !== 'undefined' && dateValue !== '') {
          const birthDate = new Date(dateValue);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          return age.toString();
        }
      }
      return '';
    }

    // Handle basic mathematical expressions
    if (/^[\d\s+\-*/().]+$/.test(formula)) {
      // eslint-disable-next-line no-eval
      return eval(formula).toString();
    }

    // Return the formula as-is if it's a simple string concatenation or other operation
    return formula;
  } catch (error) {
    console.error('Error calculating derived value:', error);
    return 'Error in formula';
  }
};