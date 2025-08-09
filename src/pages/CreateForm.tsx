import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { RootState } from '../store';
import { createNewForm, addFieldToCurrentForm, reorderFormFields } from '../store/slices/formBuilderSlice';
import { FormField } from '../types/form.types';
import FieldConfig from '../components/forms/FieldConfig';
import SaveFormDialog from '../components/forms/SaveFormDialog';

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableFieldItemProps {
  field: FormField;
  index: number;
  allFields: FormField[];
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({ field, index, allFields }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <FieldConfig
        field={field}
        index={index}
        allFields={allFields}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const CreateForm: React.FC = () => {
  const dispatch = useDispatch();
  const { currentForm } = useSelector((state: RootState) => state.formBuilder);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!currentForm) {
      dispatch(createNewForm());
    }
  }, [dispatch, currentForm]);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: `Field ${currentForm?.fields.length ? currentForm.fields.length + 1 : 1}`,
      required: false,
      validations: []
    };
    
    dispatch(addFieldToCurrentForm(newField));
  };

  const startNewForm = () => {
    dispatch(createNewForm());
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = currentForm?.fields.findIndex(field => field.id === active.id);
      const newIndex = currentForm?.fields.findIndex(field => field.id === over.id);
      
      if (oldIndex !== undefined && newIndex !== undefined && oldIndex >= 0 && newIndex >= 0) {
        dispatch(reorderFormFields({
          sourceIndex: oldIndex,
          destinationIndex: newIndex
        }));
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          {currentForm?.name ? `Edit: ${currentForm.name}` : 'Create New Form'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={startNewForm}
            sx={{ mr: 2 }}
          >
            New Form
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addField}
            sx={{ mr: 2 }}
          >
            Add Field
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setShowSaveDialog(true)}
            disabled={!currentForm || currentForm.fields.length === 0}
          >
            Save Form
          </Button>
        </Box>
      </Box>

      {!currentForm || currentForm.fields.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
          <Typography variant="h6" color="textSecondary">
            No fields added yet
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Click "Add Field" to start building your form
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={addField}>
            Add Your First Field
          </Button>
        </Paper>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentForm.fields.map(field => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {currentForm.fields.map((field, index) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                index={index}
                allFields={currentForm.fields}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <SaveFormDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />
    </Container>
  );
};

export default CreateForm;
