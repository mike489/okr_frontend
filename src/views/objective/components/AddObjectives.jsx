import { Divider, FormControl, TextField, Typography } from '@mui/material';
import { Stack } from 'immutable';
import React, { use, useState } from 'react';
import { toast } from 'react-toastify';
import theme from 'themes';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';

const AddObjectives = ({ add, isAdding, onClose, onSubmit }) => {
  const [value, setValue] = useState({
    title: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValue((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!value.title) {
      toast.error('Please fill all required fields.');
      return;
    }

    const success = await onSubmit(value); // Wait for API response
    if (success) {
      toast.success('Objective added successfully!');
      onClose(); // Close modal on success
    }
  };
  React.useEffect(() => {
    if (!add) {
      setValue({
        title: '',
       
      });
    }
  }, [add]);
  
  return (
    <DrogaFormModal
      open={add}
      title="Add Objective"
      handleClose={onClose}
      onCancel={onClose}
      onSubmit={(event) => handleSubmit(event)}
      submitting={isAdding}
    >
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={value.title}
        onChange={handleChange}
        margin="normal"
        required
      />
    </DrogaFormModal>
  );
};

export default AddObjectives;
