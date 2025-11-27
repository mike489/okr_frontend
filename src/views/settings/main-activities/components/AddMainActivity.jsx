import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  TextField,
  Autocomplete,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

// Define activity types with IDs (like API response)
const ACTIVITY_TYPES = [
  { id: 1, value: 'KPI', label: 'KPI' },
  { id: 2, value: 'Main Activity', label: 'Main Activity' },
];

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  initiative_id: Yup.string().required('Initiative is required'),
  measuring_unit_id: Yup.string().required('Measuring unit is required'),
  type: Yup.string()
    .required('Type is required')
    .oneOf(
      ACTIVITY_TYPES.map((type) => type.value),
      'Invalid activity type',
    ),
  weight: Yup.number()
    .required('Weight is required')
    .min(0, 'Weight must be at least 0')
    .typeError('Weight must be a number'),
  target: Yup.number()
    .required('Target is required')
    .min(0, 'Target must be at least 0')
    .typeError('Target must be a number'),
});

const AddMainActivity = ({
  add,
  isAdding,
  measuringUnits = [],
  initiative = [],
  onClose,
  handleSubmission,
}) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      initiative_id: '',
      measuring_unit_id: '',
      type: '',
      weight: '',
      target: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const submissionValues = {
        ...values,
        weight: Number(values.weight),
        target: Number(values.target),
      };
      console.log('Submitting values:', submissionValues);
      handleSubmission(submissionValues);
    },
  });
  React.useEffect(() => {
    if (!add) {
      formik.resetForm();
    }
  }, [add]);
  return (
    <Dialog
      open={add}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 2,
        }}
      >
        <DialogTitle variant="h3">Add Main Activity</DialogTitle>
        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {/* Title Field */}
          <FormControl
            fullWidth
            error={formik.touched.title && Boolean(formik.errors.title)}
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="title">Title</InputLabel>
            <TextField
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </FormControl>

          {/* Type Field - Autocomplete */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="type"
              options={ACTIVITY_TYPES}
              getOptionLabel={(option) => option.label}
              value={
                ACTIVITY_TYPES.find(
                  (type) => type.value === formik.values.type,
                ) || null
              }
              onChange={(event, newValue) => {
                formik.setFieldValue('type', newValue?.value || '');
              }}
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type"
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                />
              )}
            />
          </FormControl>

          {/* Initiative Field - Autocomplete */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="initiative_id"
              options={initiative}
              getOptionLabel={(option) => option.title || option.name}
              value={
                initiative.find(
                  (init) => String(init.id) === formik.values.initiative_id,
                ) || null
              }
              onChange={(event, newValue) => {
                formik.setFieldValue(
                  'initiative_id',
                  newValue?.id ? String(newValue.id) : '',
                );
              }}
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Initiative"
                  error={
                    formik.touched.initiative_id &&
                    Boolean(formik.errors.initiative_id)
                  }
                  helperText={
                    formik.touched.initiative_id && formik.errors.initiative_id
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
              disabled={initiative.length === 0}
            />
          </FormControl>

          {/* Measuring Unit Field - Autocomplete */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="measuring_unit_id"
              options={measuringUnits}
              getOptionLabel={(option) => option.name}
              value={
                measuringUnits.find(
                  (unit) => unit.id === formik.values.measuring_unit_id,
                ) || null
              }
              onChange={(event, newValue) => {
                formik.setFieldValue('measuring_unit_id', newValue?.id || '');
              }}
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Measuring Unit"
                  error={
                    formik.touched.measuring_unit_id &&
                    Boolean(formik.errors.measuring_unit_id)
                  }
                  helperText={
                    formik.touched.measuring_unit_id &&
                    formik.errors.measuring_unit_id
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
                  {option.name}
                </li>
              )}
              disabled={measuringUnits.length === 0}
            />
          </FormControl>

          {/* Weight Field */}
          <FormControl
            fullWidth
            error={formik.touched.weight && Boolean(formik.errors.weight)}
            sx={{ mb: 3 }}
          >
            <TextField
              id="weight"
              name="weight"
              label="Weight"
              type="number"
              value={formik.values.weight}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.weight && Boolean(formik.errors.weight)}
              helperText={formik.touched.weight && formik.errors.weight}
              InputProps={{
                inputProps: {
                  min: 0,
                  step: 1,
                },
              }}
            />
          </FormControl>

          {/* Target Field */}
          <FormControl
            fullWidth
            error={formik.touched.target && Boolean(formik.errors.target)}
            sx={{ mb: 2 }}
          >
            <TextField
              id="target"
              name="target"
              label="Target"
              type="number"
              value={formik.values.target}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.target && Boolean(formik.errors.target)}
              helperText={formik.touched.target && formik.errors.target}
              InputProps={{
                inputProps: {
                  min: 0,
                  step: 1,
                },
              }}
            />
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isAdding || !formik.isValid}
          >
            {isAdding ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AddMainActivity.propTypes = {
  add: PropTypes.bool.isRequired,
  isAdding: PropTypes.bool.isRequired,
  measuringUnits: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  initiative: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default AddMainActivity;
