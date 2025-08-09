import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { RootState } from '../../store';
import { saveForm } from '../../store/slices/formBuilderSlice';
import { FormSchema } from '../../types/form.types';

interface SaveFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const SaveFormDialog: React.FC<SaveFormDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { currentForm } = useSelector((state: RootState) => state.formBuilder);
  const [formName, setFormName] = useState('');

  useEffect(() => {
    if (currentForm) {
      setFormName(currentForm.name || '');
    }
  }, [currentForm, open]);

  const handleSave = () => {
    if (!formName.trim() || !currentForm) return;
    
    const form: FormSchema = {
      ...currentForm,
      name: formName.trim()
    };

    dispatch(saveForm(form));
    onClose();
  };

  const handleClose = () => {
    setFormName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Form</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Form Name"
          fullWidth
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Enter a name for your form"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={!formName.trim()}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveFormDialog;