import { TextField, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';

const EditObjective = ({
  edit,
  loading,
  onClose,
  onSubmit,
  objectiveDetails,
}) => {
  const [values, setValues] = useState({
    title: '',
    description: '',
    type: '',
    visibility: '',
    status: ''
  });

  // Load existing data into form
  useEffect(() => {
    if (objectiveDetails) {
      setValues({
        title: objectiveDetails.title || '',
        description: objectiveDetails.description || '',
        type: objectiveDetails.type || '',
        visibility: objectiveDetails.visibility || '',
        status: objectiveDetails.status || ''
      });
    }
  }, [objectiveDetails]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!values.title || !values.description || !values.type || !values.visibility || !values.status) {
      toast.error("Please fill all required fields.");
      return;
    }

    onSubmit(values);
  };

  return (
    <DrogaFormModal
      open={edit}
      title="Edit Objective"
      handleClose={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitting={loading}
    >
      {/* Title */}
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        margin="normal"
        required
      />

      {/* Description */}
      <TextField
        fullWidth
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={3}
        required
      />

      {/* Type */}
      <TextField
        select
        fullWidth
        label="Type"
        name="type"
        value={values.type}
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
        value={values.visibility}
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
        value={values.status}
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

export default EditObjective;
