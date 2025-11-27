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
  FormHelperText,
  IconButton,
  InputLabel,
  TextField,
  Autocomplete,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  plan_id: Yup.string().required('Plan is required'),
  description: Yup.string().required('Description is required'),
});

const UpdateReport = ({
  open,
  isUpdating,
  plan = [],
  reportData,
  onClose,
  handleUpdate,
}) => {
  const formik = useFormik({
    initialValues: {
      plan_id: reportData?.plan?.id || '',
      description: reportData?.description || '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      handleUpdate(values);
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <DialogTitle variant="h3">Update Report</DialogTitle>
        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {/* Description Field */}
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 3 }}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          {/* Plan Selection with Autocomplete */}
          <FormControl fullWidth error={formik.touched.plan_id && Boolean(formik.errors.plan_id)} sx={{ mb: 3 }}>
          
            <Autocomplete
              options={plan || []}
              getOptionLabel={(option) => option.main_activity?.title || option.title || ''}
              value={plan.find((p) => p.id === formik.values.plan_id) || null}
              onChange={(_, value) => formik.setFieldValue('plan_id', value ? value.id : '')}
              onBlur={formik.handleBlur}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Plan"
                  name="plan_id"
                  fullWidth
                  error={formik.touched.plan_id && Boolean(formik.errors.plan_id)}
                  helperText={formik.touched.plan_id && formik.errors.plan_id}
                />
              )}
            />
            <FormHelperText>{formik.touched.plan_id && formik.errors.plan_id}</FormHelperText>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

UpdateReport.propTypes = {
  open: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  plan: PropTypes.array.isRequired,
  reportData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default UpdateReport;
