import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Autocomplete,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  main_activity_id: Yup.string().required('Please select your plan'),
  title: Yup.string()
    .min(3, 'Task title should be at least 3 characters')
    .required('Task title is required'),
  start_date: Yup.date().nullable().required('Please select a start date'),
  deadline: Yup.date().nullable().required('Please select a deadline'),
});

const CreateTask = ({
  open,
  handleCloseModal,
  submitting,
  myMainActivities = [],
  userId,
  handleTaskSubmission,
}) => {
  const formik = useFormik({
    initialValues: {
      main_activity_id: '',
      user_id: userId,
      title: '',
      description: '',
      start_date: '',
      deadline: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Submitting task:', values);
      handleTaskSubmission(values);
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    } else {
      formik.resetForm({
        values: {
          ...formik.initialValues,
          user_id: userId,
        },
      });
    }
  }, [open, userId]);

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 2,
        }}
      >
        <DialogTitle variant="h3">Create Task</DialogTitle>
        <IconButton onClick={handleCloseModal}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <>
            {/* Plan Selection */}
            <Autocomplete
              options={myMainActivities}
              getOptionLabel={(option) => option.title || ''}
              value={
                myMainActivities.find(
                  (p) => p.id === formik.values.main_activity_id,
                ) || null
              }
              onChange={(_, value) =>
                formik.setFieldValue('main_activity_id', value ? value.id : '')
              }
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select your main activities"
                  name="main_activity_id"
                  fullWidth
                  error={
                    formik.touched.main_activity_id &&
                    Boolean(formik.errors.main_activity_id)
                  }
                  helperText={
                    formik.touched.main_activity_id &&
                    formik.errors.main_activity_id
                  }
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
              isOptionDisabled={(option) => option.disabled}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            {/* Task Title */}
            <TextField
              label="Task Title"
              name="title"
              fullWidth
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              sx={{ my: 3 }}
            />

            {/* Start Date */}
            <TextField
              label="Start Date"
              name="start_date"
              type="date"
              fullWidth
              value={formik.values.start_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.start_date && Boolean(formik.errors.start_date)
              }
              helperText={formik.touched.start_date && formik.errors.start_date}
              InputLabelProps={{ shrink: true }}
              sx={{ my: 3 }}
            />

            {/* Deadline */}
            <TextField
              label="Deadline"
              name="deadline"
              type="date"
              fullWidth
              value={formik.values.deadline}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.deadline && Boolean(formik.errors.deadline)}
              helperText={formik.touched.deadline && formik.errors.deadline}
              InputLabelProps={{ shrink: true }}
              sx={{ my: 3 }}
            />

            {/* Description */}
            <TextField
              label="Task Description (optional)"
              name="description"
              fullWidth
              multiline
              minRows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              sx={{ mb: 3 }}
            />
          </>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

CreateTask.propTypes = {
  open: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  myMainActivities: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  handleTaskSubmission: PropTypes.func.isRequired,
};

export default CreateTask;
