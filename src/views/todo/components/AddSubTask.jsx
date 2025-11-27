import React, { useEffect } from 'react';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('The sub task name is required')
    .min(3, 'Sub task name must be at least 3 characters'),
  description: Yup.string().max(300, 'At maximum description can be 300 letters'),
});

const AddSubTask = ({ open, handleCloseModal, task, handleSubmission, submitting, day }) => {
  const theme = useTheme();

  // List of valid day names
  const validDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      date: validDays.includes(day) ? day : '', // Only set if valid
    },
    validationSchema,
    onSubmit: (values) => {
      if (!values.date || !validDays.includes(values.date)) {
        toast.error('A valid day is required');
        return;
      }
      const payload = {
        task_id: task?.id ?? '',
        title: values.title,
        description: values.description,
        date: values.date, // Day name (e.g., "Monday")
      };
      console.log('Submitting payload from AddSubTask:', payload); // Debug log
      handleSubmission(payload);
    },
  });

  // Update formik date when day prop changes
  useEffect(() => {
    console.log('AddSubTask received day prop:', day); // Debug log
    if (validDays.includes(day)) {
      formik.setValues({
        title: formik.values.title,
        description: formik.values.description,
        date: day,
      });
    } else if (day || day === '') {
      console.warn('Invalid or empty day prop received:', day);
    }
  }, [day]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <DrogaFormModal
      open={open}
      title="Add Sub Task"
      handleClose={handleCloseModal}
      onCancel={handleCloseModal}
      onSubmit={formik.handleSubmit}
      submitting={submitting}
      submitDisabled={!validDays.includes(formik.values.date)} // Disable if no valid day
    >
      <Grid
        container
        spacing={1}
        sx={{ display: 'flex', borderBottom: 1, borderColor: theme.palette.divider }}
      >
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} sx={{ py: 3, pl: 4 }}>
          <Box>
            <Typography variant="subtitle1">Task name</Typography>
            <Typography variant="subtitle2">{task?.title}</Typography>
          </Box>
          <Box mt={3}>
            <Typography variant="subtitle1">KPI</Typography>
            <Typography variant="subtitle2">{task?.plan?.kpi?.name}</Typography>
          </Box>
        </Grid>
      </Grid>

      <input type="hidden" name="task_id" value={task?.id ?? ''} />

      <FormControl
        fullWidth
        error={formik.touched.title && Boolean(formik.errors.title)}
        sx={{ marginTop: 3 }}
      >
        <InputLabel htmlFor="title">Sub Task Name</InputLabel>
        <OutlinedInput
          id="title"
          name="title"
          label="Sub Task Name"
          value={formik.values.title}
          onChange={formik.handleChange}
          fullWidth
        />
        {formik.touched.title && formik.errors.title && (
          <FormHelperText error id="standard-weight-helper-text-title">
            {formik.errors.title}
          </FormHelperText>
        )}
      </FormControl>

      <FormControl
        fullWidth
        error={formik.touched.description && Boolean(formik.errors.description)}
        sx={{ marginTop: 3 }}
      >
        <InputLabel htmlFor="description">Sub Task Description (optional)</InputLabel>
        <OutlinedInput
          id="description"
          name="description"
          label="Sub Task Description (optional)"
          multiline
          minRows={3}
          value={formik.values.description}
          onChange={formik.handleChange}
          fullWidth
        />
        {formik.touched.description && formik.errors.description && (
          <FormHelperText error id="standard-weight-helper-text-description">
            {formik.errors.description}
          </FormHelperText>
        )}
      </FormControl>
    </DrogaFormModal>
  );
};

AddSubTask.propTypes = {
  open: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
  handleSubmission: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  day: PropTypes.string, // Optional, but validated if provided
};

export default AddSubTask;