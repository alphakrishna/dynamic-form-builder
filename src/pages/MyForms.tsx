import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { 
  List as ListIcon, Preview as PreviewIcon, Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { RootState } from '../store';
import { setCurrentForm, setPreviewForm, deleteForm, clearFormData } from '../store/slices/formBuilderSlice';
import { FormSchema } from '../types/form.types';

const MyForms: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedForms } = useSelector((state: RootState) => state.formBuilder);

  const handlePreview = (form: FormSchema) => {
    dispatch(setPreviewForm(form));
    dispatch(clearFormData());
    navigate('/preview');
  };

  const handleEdit = (form: FormSchema) => {
    dispatch(setCurrentForm(form));
    navigate('/create');
  };

  const handleDelete = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      dispatch(deleteForm(formId));
    }
  };

  const handleCreateNew = () => {
    navigate('/create');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Forms ({savedForms.length})
      </Typography>
      
      {savedForms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ListIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No forms created yet
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Create your first form to get started
          </Typography>
          <Button variant="contained" onClick={handleCreateNew}>
            Create Form
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {savedForms.map((form) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={form.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {form.name}
                  </Typography>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                  </Typography>
                  
                  {form.fields.some(f => f.isDerived) && (
                    <Chip 
                      label="Has Derived Fields" 
                      size="small" 
                      color="primary" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PreviewIcon />}
                    onClick={() => handlePreview(form)}
                    sx={{ mb: 1 }}
                  >
                    Preview
                  </Button>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(form)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(form.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyForms;