import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CreateActivityTypeForm = ({ open, onClose, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required')
    }),
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create Activity Type</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          label="Name"
          fullWidth
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={formik.handleSubmit} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateActivityTypeForm;
