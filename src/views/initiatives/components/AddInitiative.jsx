import {
  FormControl,
  InputLabel,
  ListItemText,
  TextField,
  Autocomplete,
} from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';

const AddInitiative = ({
  add,
  isAdding,
  onClose,
  onSubmit,
  objectives = [],
}) => {
  const [values, setValues] = useState({
    title: '',
    objective: ''
  });

  const handleChange = (event, newValue) => {
    if (newValue) {
      setValues(prev => ({ ...prev, objective: newValue.id }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.title || !values.objective) {
      toast.error('Please fill all required fields');
      return;
    }

    await onSubmit(values);
  };
  React.useEffect(() => {
    if (!add) {
      setValues({
        title: '',
        objective: ''
      });
    }
  }, [add]);
  
  return (
    <DrogaFormModal
      open={add}
      title="Add Initiative"
      handleClose={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitting={isAdding}
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
          value={objectives.find((obj) => obj.id === values.objective) || null}
          onChange={handleChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Objective"
              name="objective"
              error={!values.objective}
              helperText={!values.objective && 'Objective is required'}
            />
          )}
          renderOption={(props, option) => (
              <li
                {...props}
                key={option.id}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  borderWidth: 1,
                  borderColor: 'grey',
                  margin: '4px 0',
                  borderStyle: 'solid',
                  color: 'black',
                }}
              >
                {option.title}
              </li>
            )}
        />
      </FormControl>
    </DrogaFormModal>
  );
};

export default AddInitiative;
