import React, { useEffect } from 'react';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  Typography,
  TextField,
  Autocomplete,
  useTheme
} from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  plan_id: Yup.string().required('Please select MyPlan first'),
  title: Yup.string().required('The task name is required').min(3, 'Task name expected to be more than 3 letters')
});

const EditTask = ({ open, handleCloseModal, myPlan, selectedMyPlan, handleTaskSubmission, submitting }) => {
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      plan_id: '',
      title: '',
      description: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleTaskSubmission(values);
    }
  });

  useEffect(() => {
    if (selectedMyPlan) {
      formik.setValues({
        plan_id: selectedMyPlan?.plan?.id || '',
        title: selectedMyPlan?.title || '',
        description: selectedMyPlan?.description || ''
      });
    }
  }, [selectedMyPlan]);

  return (
    <DrogaFormModal
      open={open}
      title="Edit Task"
      handleClose={handleCloseModal}
      onCancel={handleCloseModal}
      onSubmit={formik.handleSubmit}
      submitting={submitting}
    >
      {/* Plan Selection with Autocomplete */}
      <FormControl fullWidth error={formik.touched.plan_id && Boolean(formik.errors.plan_id)}>
        <Autocomplete
          options={myPlan || []}
          getOptionLabel={(option) => option.title || ''}
          value={myPlan.find((plan) => plan.id === formik.values.plan_id) || null}
          onChange={(_, value) => formik.setFieldValue('plan_id', value ? value.id : '')}
          onBlur={formik.handleBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select MyPlan"
              name="plan_id"
              fullWidth
              error={formik.touched.plan_id && Boolean(formik.errors.plan_id)}
              helperText={formik.touched.plan_id && formik.errors.plan_id}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </FormControl>

      {/* Task Title */}
      <FormControl fullWidth error={formik.touched.title && Boolean(formik.errors.title)} sx={{ marginTop: 3 }}>

        <TextField
          id="title"
          name="title"
          label="Task name"
          value={formik.values.title}
          onChange={formik.handleChange}
          fullWidth
          spellCheck
        />
        {formik.touched.title && formik.errors.title && (
          <FormHelperText error id="standard-weight-helper-text-title">
            {formik.errors.title}
          </FormHelperText>
        )}
      </FormControl>

      {/* Task Description */}
      <FormControl fullWidth error={formik.touched.description && Boolean(formik.errors.description)} sx={{ marginTop: 3 }}>
       
        <TextField
          id="description"
          name="description"
          label="Task description (optional)"
          multiline
          minRows={3}
          value={formik.values.description}
          onChange={formik.handleChange}
          fullWidth
          spellCheck
        />
      </FormControl>
    </DrogaFormModal>
  );
};

EditTask.propTypes = {
  open: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  myPlan: PropTypes.array,
  selectedMyPlan: PropTypes.object,
  handleTaskSubmission: PropTypes.func,
  submitting: PropTypes.bool
};

export default EditTask;
