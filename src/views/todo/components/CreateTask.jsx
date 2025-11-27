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
  user_id: Yup.string().required('Please select a user'),
  title: Yup.string()
    .min(3, 'Task title should be at least 3 characters')
    .required('Task title is required'),
  start_date: Yup.string().required('Please select a start date'),
  deadline: Yup.date().nullable().required('Please select a deadline'),
});

const CreateTask = ({
  open,
  handleCloseModal,
  submitting,
  mainActivity = [],
  users = [],
  handleTaskSubmission,
  loadingUsers,
}) => {
  const formik = useFormik({
    initialValues: {
      main_activity_id: '',
      // user_id: '', // Remove if not used
      title: '',
      description: '',
      start_date: '',
      deadline: '',
    },
    validationSchema: Yup.object().shape({
      main_activity_id: Yup.string().required(
        'Please select your main activities',
      ),
      // user_id: Yup.string().required('Please select a user'), // Remove if not used
      title: Yup.string()
        .min(3, 'Task title should be at least 3 characters')
        .required('Task title is required'),
      start_date: Yup.string().required('Please select a start date'),
      deadline: Yup.date().nullable().required('Please select a deadline'),
    }),
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
      console.log('Formik errors:', formik.errors);
      handleTaskSubmission(values);
    },
  });

  useEffect(() => {
    console.log('Main activity:', mainActivity);
    console.log('Users:', users);
    if (!open) {
      formik.resetForm();
    }
  }, [open, mainActivity, users]);

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
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={mainActivity}
                getOptionLabel={(option) => option.title || ''}
                value={
                  mainActivity.find(
                    (p) =>
                      String(p.id) === String(formik.values.main_activity_id),
                  ) || null
                }
                onChange={(_, value) => {
                  console.log(
                    'Selected main_activity_id:',
                    value ? value.id : '',
                  );
                  formik.setFieldValue(
                    'main_activity_id',
                    value ? value.id : '',
                  );
                }}
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
                isOptionEqualToValue={(option, value) =>
                  value ? String(option.id) === String(value.id) : false
                }
              />

              {/* Uncomment if user_id is needed */}
              {/* <Autocomplete
                options={users}
                getOptionLabel={(option) => option.name || ''}
                value={users.find((u) => u.id === formik.values.user_id) || null}
                onChange={(_, value) => {
                  console.log('Selected user_id:', value ? value.id : '');
                  formik.setFieldValue('user_id', value ? value.id : '');
                }}
                onBlur={formik.handleBlur}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign to User"
                    name="user_id"
                    fullWidth
                    error={formik.touched.user_id && Boolean(formik.errors.user_id)}
                    helperText={formik.touched.user_id && formik.errors.user_id}
                    sx={{ my: 3 }}
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
                    {option.name}
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              /> */}

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
                helperText={
                  formik.touched.start_date && formik.errors.start_date
                }
                InputLabelProps={{ shrink: true }}
                sx={{ my: 3 }}
              />

              <TextField
                label="Deadline"
                name="deadline"
                type="date"
                fullWidth
                value={formik.values.deadline}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.deadline && Boolean(formik.errors.deadline)
                }
                helperText={formik.touched.deadline && formik.errors.deadline}
                InputLabelProps={{ shrink: true }}
                sx={{ my: 3 }}
              />

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
          )}
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
  mainActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  handleTaskSubmission: PropTypes.func.isRequired,
  loadingUsers: PropTypes.bool.isRequired,
};

export default CreateTask;
