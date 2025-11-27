import {
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';

const EditInitiative = ({
  open,
  isEditing,
  onClose,
  onEdit,
  initialData = {}, 
  objectives = []
}) => {
  const [values, setValues] = useState({
    title: '',
    objective_id: ''
  });

  useEffect(() => {
    if (initialData) {
      setValues({
        title: initialData.title || '',
        objective_id: initialData.objective?.id || ''
      });
    }
  }, [initialData, open]);

  const handleChange = (event, newValue) => {
    if (newValue) {
      setValues(prev => ({ ...prev, objective_id: newValue.id }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.title || !values.objective_id) {
      toast.error('Please fill all required fields');
      return;
    }

    await onEdit(values);
  };

  return (
    <DrogaFormModal
      open={open}
      title="Edit Initiative"
      handleClose={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitting={isEditing}
    >
      {/* Title Field */}
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        margin="normal"
        required
      />

      {/* Objective Field with Autocomplete */}
      <FormControl fullWidth margin="normal" required>
         <Autocomplete
          options={objectives}
          getOptionLabel={(option) => option.title || ''}
          value={objectives.find((obj) => obj.id === values.objective_id) || null}
          onChange={handleChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Objective"
              name="objective_id"
              error={!values.objective_id}
              helperText={!values.objective_id && 'Objective is required'}
            />
          )}
        />
      </FormControl>
    </DrogaFormModal>
  );
};

export default EditInitiative;
