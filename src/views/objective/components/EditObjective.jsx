import { TextField } from '@mui/material';
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
    title: ''
  });

  useEffect(() => {
    if (objectiveDetails) {
      setValues({
        title: objectiveDetails.title || ''
      });
    }
  }, [objectiveDetails]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.title) {
      toast.error('Title is required');
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
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        margin="normal"
        required
      />
    </DrogaFormModal>
  );
};

export default EditObjective;