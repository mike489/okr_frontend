import * as React from 'react';
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
  Grid,
  FormHelperText,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const validationSchema = Yup.object().shape({
  start_date: Yup.date()
    .required('Start date is required')
    .nullable()
    .typeError('Start date must be a valid date'),
  end_date: Yup.date()
    .required('End date is required')
    .nullable()
    .typeError('End date must be a valid date')
    .min(Yup.ref('start_date'), 'End date must be on or after start date'),
  executive_summary: Yup.string().required('Executive summary is required'),
  introduction: Yup.string().required('Introduction is required'),
  performance_indicators: Yup.string().required('Performance indicators are required'),
  monthly_actions: Yup.string().required('Monthly actions are required'),
  budget_utilization: Yup.string().required('Budget utilization is required'),
  challenges: Yup.string().required('Challenges are required'),
  corrective_actions: Yup.string().required('Corrective actions are required'),
  next_steps: Yup.string().required('Next steps are required'),
  conclusion: Yup.string().required('Conclusion is required'),
});

const ReportForm = ({
  open,
  isSubmitting,
  onClose,
  onSubmit,
  initialValues: propInitialValues,
  isUpdate = false,
}) => {
  const defaultValues = {
    start_date: '', 
    end_date: '',   
    executive_summary: '',
    introduction: '',
    performance_indicators: '',
    monthly_actions: '',
    budget_utilization: '',
    challenges: '',
    corrective_actions: '',
    next_steps: '',
    conclusion: '',
  };

  const formik = useFormik({
    initialValues: propInitialValues || defaultValues,
    validationSchema,
    onSubmit: (values) => {
      // Ensure dates are in the desired format (YYYY/MM/DD) for submission
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.replace(/-/g, '/') : null,
        end_date: values.end_date ? values.end_date.replace(/-/g, '/') : null,
      };
      onSubmit(formattedValues);
    },
  });

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
  ];

  React.useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <DialogTitle variant="h3">{isUpdate ? 'Update' : 'Create'} Report</DialogTitle>
        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </Box>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} >
            {/* Date Fields */}
            <Grid container spacing={2} display="flex" flexDirection="row" alignItems="center">
            {['start_date', 'end_date'].map((name) => (
              <Grid item xs={12} md={6} key={name} >
                <TextField
                  label={name.replace(/_/g, ' ')}
                  name={name}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formik.values[name] || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched[name] && Boolean(formik.errors[name])}
                  helperText={formik.touched[name] && formik.errors[name]}
                  className="capitalize"
                />
              </Grid>
            ))}

            </Grid>
            {/* Rich Text Fields */}
            {[
              'executive_summary',
              'introduction',
              'performance_indicators',
              'monthly_actions',
              'budget_utilization',
              'challenges',
              'corrective_actions',
              'next_steps',
              'conclusion',
            ].map((name) => (
              <Grid item xs={12} key={name}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {name.replace(/_/g, ' ')}
                </Typography>
                <ReactQuill
                  theme="snow"
                  value={formik.values[name]}
                  onChange={(value) => formik.setFieldValue(name, value)}
                  onBlur={() => formik.setFieldTouched(name, true)}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: 'auto', marginBottom: '40px' }}
                />
                {formik.touched[name] && formik.errors[name] && (
                  <FormHelperText error sx={{ mt: 6 }}>
                    {formik.errors[name]}
                  </FormHelperText>
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : isUpdate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ReportForm.propTypes = {
  open: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    executive_summary: PropTypes.string,
    introduction: PropTypes.string,
    performance_indicators: PropTypes.string,
    monthly_actions: PropTypes.string,
    budget_utilization: PropTypes.string,
    challenges: PropTypes.string,
    corrective_actions: PropTypes.string,
    next_steps: PropTypes.string,
    conclusion: PropTypes.string,
  }),
  isUpdate: PropTypes.bool,
};

ReportForm.defaultProps = {
  initialValues: null,
  isSubmitting: false,
  isUpdate: false,
};

export default ReportForm;