import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import { RootState } from '../store';
import { clearFormData, setCurrentForm } from '../store/slices/formBuilderSlice';
import { useFormValidation } from '../hooks/useFormValidation';
import FormRenderer from '../components/forms/FormRenderer';

const PreviewForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { previewForm, currentForm, formData } = useSelector((state: RootState) => state.formBuilder);
  const { validateAllFields } = useFormValidation();
  
  const form = previewForm || currentForm;

  useEffect(() => {
    dispatch(clearFormData());
  }, [form, dispatch]);

  if (!form) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          No form selected for preview. Please create a form first or select from "My Forms".
        </Alert>
      </Container>
    );
  }

  const handleSubmit = () => {
    const isValid = validateAllFields(form.fields, formData);
    
    if (isValid) {
      alert('Form submitted successfully!\n\nForm Data: ' + JSON.stringify(formData, null, 2));
    } else {
      alert('Please fix the validation errors before submitting.');
    }
  };

  const handleEdit = () => {
    dispatch(setCurrentForm(form));
    navigate('/create');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with title and edit button */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Typography variant="h4" gutterBottom>
          Preview: {form.name || 'Untitled Form'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Form
        </Button>
      </Box>
      
      <Paper sx={{ p: 4 }}>
        {/* Display the form name as the title users will see */}
        {form.name && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              {form.name}
            </Typography>
            <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 3 }} />
          </>
        )}
        
        <FormRenderer form={form} />
        
        <Box mt={4} pt={3} borderTop="1px solid #e0e0e0">
          <Button variant="contained" size="large" onClick={handleSubmit}>
            Submit Form
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PreviewForm;