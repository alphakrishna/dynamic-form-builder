import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { RootState } from '../../store';
import { FormSchema, FormField } from '../../types/form.types';
import { updateFormField, setFormError } from '../../store/slices/formBuilderSlice';
import { validateField } from '../../utils/validation.utils';
import { calculateDerivedValue } from '../../utils/derivation.utils';

interface FormRendererProps {
  form: FormSchema;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form }) => {
  const dispatch = useDispatch();
  const { formData, formErrors } = useSelector((state: RootState) => state.formBuilder);

  useEffect(() => {
    // Calculate derived fields and validate all fields
    form.fields.forEach(field => {
      if (field.isDerived) {
        const derivedValue = calculateDerivedValue(field, formData);
        dispatch(updateFormField({ fieldId: field.id, value: derivedValue }));
      }
      
      const currentValue = formData[field.id];
      const error = validateField(field, currentValue);
      dispatch(setFormError({ fieldId: field.id, error: error || '' }));
    });
  }, [form, formData, dispatch]);

  const handleFieldChange = (fieldId: string, value: any) => {
    dispatch(updateFormField({ fieldId, value }));
  };

  const renderField = (field: FormField) => {
    const value = field.isDerived 
      ? calculateDerivedValue(field, formData) 
      : formData[field.id] || field.defaultValue || '';
    const error = formErrors[field.id];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            required={field.required}
            disabled={field.isDerived}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            required={field.required}
            disabled={field.isDerived}
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            required={field.required}
            disabled={field.isDerived}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.isDerived}
            >
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl error={!!error} disabled={field.isDerived}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map(option => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                  disabled={field.isDerived}
                />
              ))}
            </RadioGroup>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl error={!!error} disabled={field.isDerived}>
            <FormLabel>{field.label}</FormLabel>
            <FormGroup>
              {field.options?.map(option => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(value as string[] || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = value as string[] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option);
                        handleFieldChange(field.id, newValues);
                      }}
                      disabled={field.isDerived}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {form.fields.map((field) => (
        <Box key={field.id} mb={3}>
          {renderField(field)}
          {field.isDerived && (
            <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
              Derived field - automatically calculated
            </Typography>
          )}
        </Box>
      ))}
    </>
  );
};

export default FormRenderer;