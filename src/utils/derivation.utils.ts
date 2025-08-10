import { FormField } from '../types/form.types';

export const calculateDerivedValue = (
  field: FormField, 
  formData: Record<string, any>
): any => {
  if (!field.isDerived || !field.parentFields || !field.derivationFormula) {
    return '';
  }

  try {
    let formula = field.derivationFormula.trim();
    
    // Handle special functions first (before field replacement)
    if (formula.includes('calculateAge')) {
      const dateMatch = formula.match(/calculateAge\(([^)]+)\)/);
      if (dateMatch) {
        let dateFieldId = dateMatch[1].trim();
        const dateValue = formData[dateFieldId] || '';
        
        if (dateValue && dateValue !== 'undefined' && dateValue !== '') {
          const birthDate = new Date(dateValue);
          if (isNaN(birthDate.getTime())) {
            return 'Invalid date';
          }
          
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

    // Determine if this is a mathematical operation or string concatenation
    const hasQuotes = formula.includes('"') || formula.includes("'");
    const hasStringConcatPattern = /\+\s*["']/.test(formula) || /["']\s*\+/.test(formula);
    const isStringOperation = hasQuotes || hasStringConcatPattern;
    
    // Replace parent field IDs with their actual values
    field.parentFields.forEach(parentId => {
      const parentValue = formData[parentId] || '';
      
      if (isStringOperation) {
        // For string operations, always wrap field values in quotes
        formula = formula.replace(new RegExp(`\\b${parentId}\\b`, 'g'), `"${parentValue}"`);
      } else {
        // For mathematical operations, use numeric values if possible
        const numericValue = parseFloat(parentValue.toString());
        const isNumeric = !isNaN(numericValue) && isFinite(numericValue);
        
        if (isNumeric) {
          formula = formula.replace(new RegExp(`\\b${parentId}\\b`, 'g'), numericValue.toString());
        } else {
          // If not numeric but no quotes detected, treat as string
          formula = formula.replace(new RegExp(`\\b${parentId}\\b`, 'g'), `"${parentValue}"`);
        }
      }
    });

    // Try to evaluate the formula
    try {
      const result = eval(formula);
      
      // Handle different result types
      if (typeof result === 'number') {
        return isNaN(result) ? 'Invalid calculation' : result.toString();
      } else if (typeof result === 'string') {
        return result;
      } else {
        return result.toString();
      }
    } catch (evalError) {
      console.error('Formula evaluation error:', evalError);
      return 'Invalid formula';
    }

  } catch (error) {
    console.error('Error calculating derived value:', error);
    return 'Formula error';
  }
};

// Validation function for derivation formulas
export const validateDerivationFormula = (
  formula: string,
  parentFields: string[],
  allFields: FormField[]
): string | null => {
  if (!formula.trim()) {
    return 'Formula is required for derived fields';
  }

  // Check for basic syntax issues
  const openParens = (formula.match(/\(/g) || []).length;
  const closeParens = (formula.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return 'Mismatched parentheses in formula';
  }

  // Remove string literals (content within quotes) before checking field references
  let formulaWithoutStrings = formula;
  
  // Remove double-quoted strings
  formulaWithoutStrings = formulaWithoutStrings.replace(/"[^"]*"/g, '');
  
  // Remove single-quoted strings
  formulaWithoutStrings = formulaWithoutStrings.replace(/'[^']*'/g, '');

  // Check if all referenced fields exist in parentFields
  const fieldReferences = formulaWithoutStrings.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
  const validFunctions = ['calculateAge'];
  
  for (const ref of fieldReferences) {
    if (!validFunctions.includes(ref) && !parentFields.includes(ref)) {
      return `Unknown field reference: ${ref}. Make sure to select it as a parent field.`;
    }
  }

  // Check for potentially dangerous patterns
  if (/[;{}]/.test(formula)) {
    return 'Formula contains invalid characters';
  }

  // Validate calculateAge function usage
  if (formula.includes('calculateAge')) {
    const ageMatches = formula.match(/calculateAge\([^)]*\)/g) || [];
    for (const match of ageMatches) {
      const fieldRef = match.match(/calculateAge\(([^)]+)\)/)?.[1];
      if (fieldRef && !parentFields.includes(fieldRef)) {
        return `calculateAge references unknown field: ${fieldRef}`;
      }
    }
  }

  return null;
};