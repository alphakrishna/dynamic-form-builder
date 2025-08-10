import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import { FormField, ValidationRule } from '../../types/form.types';
import { validateDerivationFormula } from '../../utils/derivation.utils';
import { updateFieldInCurrentForm, deleteFieldFromCurrentForm } from '../../store/slices/formBuilderSlice';

interface FieldConfigProps {
  field: FormField;
  index: number;
  allFields: FormField[];
  dragHandleProps?: any;
}

const FieldConfig: React.FC<FieldConfigProps> = ({ field, index, allFields, dragHandleProps }) => {
  const dispatch = useDispatch();
  const [showValidations, setShowValidations] = useState(false);
  const [optionsInput, setOptionsInput] = useState(field.options?.join(', ') || '');
  const [formulaError, setFormulaError] = useState<string>('');
  const updateField = (updates: Partial<FormField>) => {
    dispatch(updateFieldInCurrentForm({ 
      index, 
      field: { ...field, ...updates } 
    }));
  };

  const addValidation = () => {
    const newValidation: ValidationRule = {
      type: 'required',
      message: 'This field is required'
    };
    updateField({
      validations: [...field.validations, newValidation]
    });
  };

  const updateValidation = (validationIndex: number, validation: ValidationRule) => {
    const newValidations = [...field.validations];
    newValidations[validationIndex] = validation;
    updateField({ validations: newValidations });
  };

  const removeValidation = (validationIndex: number) => {
    updateField({
      validations: field.validations.filter((_, i) => i !== validationIndex)
    });
  };

  const validateFormula = (formula: string) => {
    if (!field.parentFields?.length) {
      setFormulaError('');
      return;
    }
    
    const error = validateDerivationFormula(formula, field.parentFields, allFields);
    setFormulaError(error || '');
  };

  const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Optional: You could add a toast notification here if you have one
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

  return (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <div {...dragHandleProps}>
              <DragIcon sx={{ cursor: 'grab', mr: 1 }} />
            </div>
            <Typography variant="h6">
              {field.label || 'New Field'}
            </Typography>
          </Box>
          <IconButton onClick={() => dispatch(deleteFieldFromCurrentForm(index))} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Field Label"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
            />
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={field.type}
                label="Field Type"
                onChange={(e) => updateField({ type: e.target.value as any })}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="textarea">Textarea</MenuItem>
                <MenuItem value="select">Select</MenuItem>
                <MenuItem value="radio">Radio</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={2}>
          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                onChange={(e) => updateField({ required: e.target.checked })}
              />
            }
            label="Required Field"
          />
        </Box>

        {/* REPLACE THE EXISTING OPTIONS SECTION WITH THIS */}
        {['select', 'radio', 'checkbox'].includes(field.type) && (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Options (comma separated)"
              value={optionsInput}
              onChange={(e) => {
                setOptionsInput(e.target.value);
                // Only update the field when there's a complete comma-separated value
                const options = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                updateField({ options });
              }}
              onBlur={() => {
                // Process final value on blur to ensure consistency
                const options = optionsInput.split(',').map((s: string) => s.trim()).filter(Boolean);
                updateField({ options });
              }}
              helperText="Enter options separated by commas"
            />
          </Box>
        )}

        <Box mt={2}>
          <FormControlLabel
            control={
              <Switch
                checked={field.isDerived || false}
                onChange={(e) => updateField({ isDerived: e.target.checked })}
              />
            }
            label="Derived Field"
          />
        </Box>

        {field.isDerived && (
          <Box mt={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Parent Fields</InputLabel>
              <Select
                multiple
                value={field.parentFields || []}
                label="Parent Fields"
                onChange={(e) => updateField({ parentFields: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={allFields.find(f => f.id === value)?.label || value} />
                    ))}
                  </Box>
                )}
              >
                {allFields.filter(f => f.id !== field.id && !f.isDerived).map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.label} (ID: {f.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Show selected parent field IDs for reference */}
            {field.parentFields && field.parentFields.length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Field IDs for Formula:
                </Typography>
                {field.parentFields.map((parentId) => {
                  const parentField = allFields.find(f => f.id === parentId);
                  return (
                    <Box key={parentId} sx={{ 
                      mb: 0.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="code" sx={{ 
                          bgcolor: '#e3f2fd', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 0.5,
                          fontFamily: 'monospace'
                        }}>
                          {parentId}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({parentField?.label})
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(parentId)}
                        title="Copy field ID"
                        sx={{ ml: 1 }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Derivation Formula"
              value={field.derivationFormula || ''}
              onChange={(e) => {
                updateField({ derivationFormula: e.target.value });
                validateFormula(e.target.value);
              }}
              onBlur={(e) => validateFormula(e.target.value)}
              error={!!formulaError}
              helperText={
                formulaError || 
                (field.parentFields && field.parentFields.length > 0 
                  ? `Mathematical: ${field.parentFields[0]} + ${field.parentFields[1] || '10'} | Age: calculateAge(${field.parentFields[0]}) | String: ${field.parentFields[0]} + " suffix"`
                  : "Select parent fields first, then use their IDs in your formula")
              }
              multiline
              rows={2}
              placeholder="Examples:&#10;• Math: field1 + field2 * 100&#10;• Age: calculateAge(birthDateField)&#10;• String: field1 + ' - ' + field2"
            />
          </Box>
        )}

        <Box mt={2}>
          <Button onClick={() => setShowValidations(!showValidations)}>
            {showValidations ? 'Hide' : 'Show'} Validations ({field.validations.length})
          </Button>
        </Box>

        {showValidations && (
          <Box mt={2}>
            {field.validations.map((validation, validationIndex) => (
              <Card key={validationIndex} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={3}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={validation.type}
                        onChange={(e) => updateValidation(validationIndex, {
                          ...validation,
                          type: e.target.value as any
                        })}
                      >
                        <MenuItem value="required">Required</MenuItem>
                        <MenuItem value="minLength">Min Length</MenuItem>
                        <MenuItem value="maxLength">Max Length</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="password">Password</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {['minLength', 'maxLength'].includes(validation.type) && (
                    <Grid size={2}>
                      <TextField
                        size="small"
                        type="number"
                        value={validation.value || ''}
                        onChange={(e) => updateValidation(validationIndex, {
                          ...validation,
                          value: parseInt(e.target.value)
                        })}
                      />
                    </Grid>
                  )}
                  <Grid size={5}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Error Message"
                      value={validation.message}
                      onChange={(e) => updateValidation(validationIndex, {
                        ...validation,
                        message: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid size={2}>
                    <IconButton size="small" onClick={() => removeValidation(validationIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
            <Button startIcon={<AddIcon />} onClick={addValidation}>
              Add Validation
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldConfig;