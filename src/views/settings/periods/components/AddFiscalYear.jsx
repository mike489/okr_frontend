import React, { useState } from 'react';
import { Box, FormControl, FormHelperText, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { add } from 'date-fns';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import DateRangesPicker from './DateRangesPicker';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Fiscal year name is required'),
  year: Yup.string().required('The year label is required'),
  description: Yup.string().required('Description is required'),
});

const AddFiscalYear = ({ open, handleCloseModal, handleSubmission, submitting }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(add(new Date(), { years: 1 }));

  const formik = useFormik({
    initialValues: {
      name: '',
      year: '',
      description: ''
    },
    validationSchema,
    onSubmit: (values) => {
      handleSubmission({
        ...values,
        start_date: startDate.toISOString().split('T')[0], // format YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],     // format YYYY-MM-DD
      });
    },
  });

  return (
    <DrogaFormModal
      open={open}
      title="Add Fiscal Year"
      handleClose={handleCloseModal}
      onCancel={handleCloseModal}
      onSubmit={formik.handleSubmit}
      submitting={submitting}
    >
      {/* Name */}
      <FormControl fullWidth sx={{ mb: 2 }} error={formik.touched.name && Boolean(formik.errors.name)}>
        <InputLabel htmlFor="name">Fiscal Year Name</InputLabel>
        <OutlinedInput
          id="name"
          name="name"
          label="Fiscal Year Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          fullWidth
        />
        {formik.touched.name && formik.errors.name && (
          <FormHelperText error>{formik.errors.name}</FormHelperText>
        )}
      </FormControl>

      {/* Year */}
      <FormControl fullWidth sx={{ mb: 2 }} error={formik.touched.year && Boolean(formik.errors.year)}>
        <InputLabel htmlFor="year">Year Label</InputLabel>
        <OutlinedInput
          id="year"
          name="year"
          label="Year"
          value={formik.values.year}
          onChange={formik.handleChange}
          fullWidth
        />
        {formik.touched.year && formik.errors.year && (
          <FormHelperText error>{formik.errors.year}</FormHelperText>
        )}
      </FormControl>

      {/* Description */}
      <FormControl fullWidth sx={{ mb: 2 }} error={formik.touched.description && Boolean(formik.errors.description)}>
        <InputLabel htmlFor="description">Description</InputLabel>
        <OutlinedInput
          id="description"
          name="description"
          label="Description"
          value={formik.values.description}
          onChange={formik.handleChange}
          fullWidth
        />
        {formik.touched.description && formik.errors.description && (
          <FormHelperText error>{formik.errors.description}</FormHelperText>
        )}
      </FormControl>

      {/* Date Range Picker */}
      <Box sx={{ mt: 4 }}>
        <DateRangesPicker
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </Box>
    </DrogaFormModal>
  );
};

AddFiscalYear.propTypes = {
  open: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmission: PropTypes.func,
  submitting: PropTypes.bool,
};

export default AddFiscalYear;
