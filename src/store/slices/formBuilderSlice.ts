  import { createSlice, PayloadAction } from '@reduxjs/toolkit';
  import { FormBuilderState, FormSchema, FormField } from '../../types/form.types';
  import { loadFormsFromStorage, saveFormsToStorage } from '../../utils/localStorage.utils';

  const initialState: FormBuilderState = {
    savedForms: loadFormsFromStorage(),
    currentForm: null,
    previewForm: null,
    formData: {},
    formErrors: {}
  };

  const formBuilderSlice = createSlice({
    name: 'formBuilder',
    initialState,
    reducers: {
      setCurrentForm: (state, action: PayloadAction<FormSchema | null>) => {
        state.currentForm = action.payload;
      },
      
      setPreviewForm: (state, action: PayloadAction<FormSchema | null>) => {
        state.previewForm = action.payload;
      },
      
      saveForm: (state, action: PayloadAction<FormSchema>) => {
        const existingIndex = state.savedForms.findIndex(f => f.id === action.payload.id);
        if (existingIndex >= 0) {
          state.savedForms[existingIndex] = action.payload;
        } else {
          state.savedForms.push(action.payload);
        }
        saveFormsToStorage(state.savedForms);
      },
      
      deleteForm: (state, action: PayloadAction<string>) => {
        state.savedForms = state.savedForms.filter(f => f.id !== action.payload);
        saveFormsToStorage(state.savedForms);
        
        if (state.currentForm?.id === action.payload) {
          state.currentForm = null;
        }
        if (state.previewForm?.id === action.payload) {
          state.previewForm = null;
        }
      },
      
      updateFormField: (state, action: PayloadAction<{ fieldId: string; value: any }>) => {
        state.formData[action.payload.fieldId] = action.payload.value;
      },
      
      setFormError: (state, action: PayloadAction<{ fieldId: string; error: string }>) => {
        if (action.payload.error) {
          state.formErrors[action.payload.fieldId] = action.payload.error;
        } else {
          delete state.formErrors[action.payload.fieldId];
        }
      },
      
      clearFormData: (state) => {
        state.formData = {};
        state.formErrors = {};
      },
      
      addFieldToCurrentForm: (state, action: PayloadAction<FormField>) => {
        if (state.currentForm) {
          state.currentForm.fields.push(action.payload);
        }
      },
      
      updateFieldInCurrentForm: (state, action: PayloadAction<{ index: number; field: FormField }>) => {
        if (state.currentForm) {
          state.currentForm.fields[action.payload.index] = action.payload.field;
        }
      },
      
      deleteFieldFromCurrentForm: (state, action: PayloadAction<number>) => {
        if (state.currentForm) {
          state.currentForm.fields.splice(action.payload, 1);
        }
      },
      
      createNewForm: (state) => {
        state.currentForm = {
          id: `form_${Date.now()}`,
          name: '',
          fields: [],
          createdAt: new Date().toISOString()
        };
      },
      
      // Add the new reorderFormFields action
      reorderFormFields: (state, action: PayloadAction<{ sourceIndex: number, destinationIndex: number }>) => {
        if (!state.currentForm) return;
        
        const { sourceIndex, destinationIndex } = action.payload;
        const fields = [...state.currentForm.fields];
        const [removed] = fields.splice(sourceIndex, 1);
        fields.splice(destinationIndex, 0, removed);
        state.currentForm.fields = fields;
      }
    }
  });

  export const {
    setCurrentForm,
    setPreviewForm,
    saveForm,
    deleteForm,
    updateFormField,
    setFormError,
    clearFormData,
    addFieldToCurrentForm,
    updateFieldInCurrentForm,
    deleteFieldFromCurrentForm,
    createNewForm,
    reorderFormFields
  } = formBuilderSlice.actions;

  export default formBuilderSlice.reducer;
