import React from 'react';
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
  TextField,
  Autocomplete,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';


const ACTIVITY_TYPES = [
  { id: 1, value: 'Indicator', label: 'Indicator' },
  { id: 2, value: 'Main Activity', label: 'Main Activity' },
];

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  initiative_id: Yup.string().required('Initiative is required'),
  measuring_unit_id: Yup.string().required('Measuring unit is required'),
  type: Yup.string()
    .required('Type is required')
    .oneOf(ACTIVITY_TYPES.map((t) => t.value), 'Invalid activity type'),
  weight: Yup.number()
    .required('Weight is required')
    .min(0, 'Weight must be at least 0')
    .typeError('Weight must be a number'),
  target: Yup.number()
    .required('Target is required')
    .min(0, 'Target must be at least 0')
    .typeError('Target must be a number'),
});


const normalizeIncomingTypeToValue = (rawType) => {
  if (!rawType && rawType !== 0) return '';
  const s = String(rawType).trim();

  // Try exact match first
  const exact = ACTIVITY_TYPES.find((t) => t.value === s);
  if (exact) return exact.value;

  // Case-insensitive match
  const caseInsensitive = ACTIVITY_TYPES.find((t) => t.value.toLowerCase() === s.toLowerCase());
  if (caseInsensitive) return caseInsensitive.value;

  // Replace underscores/spaces, compare lowercased (e.g. "main_activity" or "main activity")
  const normalized = s.toLowerCase().replace(/[_\s]+/g, ' ');
  const fuzzy = ACTIVITY_TYPES.find((t) =>
    t.value.toLowerCase().replace(/[_\s]+/g, ' ') === normalized
  );
  if (fuzzy) return fuzzy.value;

  // Nothing matched
  return '';
};

const EditMainActivity = ({
  edit,
  isEditing,
  measuringUnits = [],
  initiatives = [],
  selectedActivity,
  onClose,
  handleSubmission,
}) => {
  // Compute initial type value normalized to one of ACTIVITY_TYPES.value
  const initialTypeValue = normalizeIncomingTypeToValue(selectedActivity?.type);

  const formik = useFormik({
    initialValues: {
      title: selectedActivity?.title ?? '',
      initiative_id:
        (selectedActivity?.initiative?.id ?? selectedActivity?.initiative_id ?? '')?.toString() ?? '',
      measuring_unit_id:
        (selectedActivity?.measuring_unit?.id ?? selectedActivity?.measuring_unit_id ?? '')?.toString() ?? '',
      // set the normalized type value (exact string like "KPI" or "Main Activity")
      type: initialTypeValue ?? '',
      // ensure numeric fields are numbers (or empty string)
      weight: selectedActivity?.weight !== undefined && selectedActivity?.weight !== null
        ? Number(selectedActivity.weight)
        : '',
      target: selectedActivity?.target !== undefined && selectedActivity?.target !== null
        ? Number(selectedActivity.target)
        : '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Final payload — type will be the exact string ("KPI" or "Main Activity")
      const submissionValues = {
        ...values,
        weight: Number(values.weight),
        target: Number(values.target),
      };
      console.log('EditMainActivity - submitting:', submissionValues);
      handleSubmission(submissionValues);
    },
    enableReinitialize: true, // important so new selectedActivity re-inits form
  });

  // Prepare valid initiatives list and ensure the currently selected initiative is present
  const validInitiatives = (initiatives || []).filter((i) => i && (i.title || i.name));
  if (selectedActivity?.initiative && !validInitiatives.some((i) => String(i.id) === String(selectedActivity.initiative.id))) {
    validInitiatives.push({
      id: selectedActivity.initiative.id,
      title: selectedActivity.initiative.title || selectedActivity.initiative.name || 'Unknown',
    });
  }

  const getInitiativeValue = () => {
    const found = validInitiatives.find((init) => String(init?.id) === String(formik.values.initiative_id));
    if (found) return found;
    if (selectedActivity?.initiative) {
      return {
        id: selectedActivity.initiative.id,
        title: selectedActivity.initiative.title || selectedActivity.initiative.name || 'Unknown',
      };
    }
    return null;
  };

  return (
    <Dialog open={edit} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <DialogTitle variant="h5" sx={{ fontWeight: 'bold' }}>Edit Main Activity</DialogTitle>
        <IconButton onClick={onClose}><IconX size={20} /></IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {/* Title */}
          <FormControl fullWidth sx={{ mb: 3 }}>
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

          {/* Type */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="type"
              options={ACTIVITY_TYPES}
              getOptionLabel={(option) => option.label ?? option.value}
              // value must be the matching object from ACTIVITY_TYPES or null
              value={ACTIVITY_TYPES.find((t) => t.value === formik.values.type) ?? null}
              onChange={(event, newValue) => {
                // newValue.value is exact string expected by backend, e.g. "KPI" or "Main Activity"
                formik.setFieldValue('type', newValue?.value ?? '');
                formik.setFieldTouched('type', true, true);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type"
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </FormControl>

          {/* Initiative */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="initiative_id"
              options={validInitiatives}
              getOptionLabel={(option) => option?.title ?? option?.name ?? 'Unknown'}
              value={getInitiativeValue()}
              onChange={(event, newValue) => {
                formik.setFieldValue('initiative_id', newValue?.id ? String(newValue.id) : '');
                formik.setFieldTouched('initiative_id', true, true);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Initiative"
                  error={formik.touched.initiative_id && Boolean(formik.errors.initiative_id)}
                  helperText={formik.touched.initiative_id && formik.errors.initiative_id}
                />
              )}
              disabled={validInitiatives.length === 0}
            />
            {validInitiatives.length === 0 && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                No initiatives available.
              </Typography>
            )}
          </FormControl>

          {/* Measuring unit */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              id="measuring_unit_id"
              options={measuringUnits}
              getOptionLabel={(option) => option?.name ?? ''}
              value={measuringUnits.find((u) => String(u.id) === String(formik.values.measuring_unit_id)) ?? null}
              onChange={(event, newValue) => {
                formik.setFieldValue('measuring_unit_id', newValue?.id ? String(newValue.id) : '');
                formik.setFieldTouched('measuring_unit_id', true, true);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Measuring Unit"
                  error={formik.touched.measuring_unit_id && Boolean(formik.errors.measuring_unit_id)}
                  helperText={formik.touched.measuring_unit_id && formik.errors.measuring_unit_id}
                />
              )}
            />
          </FormControl>

          {/* Weight */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              id="weight"
              name="weight"
              label="Weight"
              type="number"
              value={formik.values.weight}
              onChange={(e) => formik.setFieldValue('weight', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={formik.handleBlur}
              error={formik.touched.weight && Boolean(formik.errors.weight)}
              helperText={formik.touched.weight && formik.errors.weight}
              // InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
          </FormControl>

          {/* Target */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              id="target"
              name="target"
              label="Target"
              type="number"
              value={formik.values.target}
              onChange={(e) => formik.setFieldValue('target', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={formik.handleBlur}
              error={formik.touched.target && Boolean(formik.errors.target)}
              helperText={formik.touched.target && formik.errors.target}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isEditing || !formik.isValid}>
            {isEditing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

EditMainActivity.propTypes = {
  edit: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  measuringUnits: PropTypes.array,
  initiatives: PropTypes.array,
  selectedActivity: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default EditMainActivity;
