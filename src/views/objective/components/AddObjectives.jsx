import { TextField, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';

const AddObjectives = ({ add, isAdding, onClose, onSubmit }) => {
  const [value, setValue] = useState({
    title: '',
    description: '',
    type: '',
    visibility: '',
    status: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!value.title || !value.description || !value.type || !value.visibility || !value.status) {
      toast.error('Please fill all required fields.');
      return;
    }

    const success = await onSubmit(value);
    if (success) {
      toast.success('Objective added successfully!');
      onClose();
    }
  };

  useEffect(() => {
    if (!add) {
      setValue({
        title: '',
        description: '',
        type: '',
        visibility: '',
        status: ''
      });
    }
  }, [add]);

  return (
    <DrogaFormModal
      open={add}
      title="Add Objective"
      handleClose={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitting={isAdding}
    >
      {/* Title */}
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={value.title}
        onChange={handleChange}
        margin="normal"
        required
      />

      {/* Description */}
      <TextField
        fullWidth
        label="Description"
        name="description"
        value={value.description}
        onChange={handleChange}
        margin="normal"
        required
        multiline
        rows={3}
      />

      {/* Type */}
      <TextField
        select
        fullWidth
        label="Type"
        name="type"
        value={value.type}
        onChange={handleChange}
        margin="normal"
        required
      >
        <MenuItem value="Company">Company</MenuItem>
        <MenuItem value="Department">Department</MenuItem>
        <MenuItem value="Team">Team</MenuItem>
      </TextField>

      {/* Visibility */}
      <TextField
        select
        fullWidth
        label="Visibility"
        name="visibility"
        value={value.visibility}
        onChange={handleChange}
        margin="normal"
        required
      >
        <MenuItem value="Public">Public</MenuItem>
        <MenuItem value="Private">Private</MenuItem>
        <MenuItem value="Internal">Internal</MenuItem>
      </TextField>

      {/* Status */}
      <TextField
        select
        fullWidth
        label="Status"
        name="status"
        value={value.status}
        onChange={handleChange}
        margin="normal"
        required
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
        <MenuItem value="archived">Archived</MenuItem>
      </TextField>
    </DrogaFormModal>
  );
};

export default AddObjectives;
