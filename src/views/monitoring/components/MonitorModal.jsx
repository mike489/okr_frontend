import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  OutlinedInput,
  Typography,
  useTheme,
  Autocomplete,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

// Validation schema including month
const validationSchema = Yup.object().shape({
  actual_value: Yup.string().required('Evaluation value is required'),
  month: Yup.string().required('Month is required'),
});

// Function to generate month options from startDate or fiscalYear to current month
const generateMonthOptions = (startDate, fiscalYear) => {
  let start;
  const currentDate = new Date();

  // Parse startDate if provided
  if (startDate && !isNaN(new Date(startDate))) {
    start = new Date(startDate);
  } else if (typeof fiscalYear === 'string' && fiscalYear.includes('-')) {
    // Parse fiscalYear (e.g., "2024-2025")
    const [startYear] = fiscalYear.split('-').map(Number);
    if (!isNaN(startYear)) {
      start = new Date(startYear, 0, 1); // Fiscal year starts January 1
    }
  }

  // Fallback to current year's January 1 if start is invalid
  if (!start || isNaN(start)) {
    console.warn(
      'Invalid startDate or fiscalYear, using current year January 1',
    );
    start = new Date(currentDate.getFullYear(), 0, 1);
  }

  // Use current date as end date if start is in the future
  const endDate = start > currentDate ? start : currentDate;

  const months = [];
  let current = new Date(start);

  console.log('generateMonthOptions startDate:', startDate);
  console.log('generateMonthOptions fiscalYear:', fiscalYear);
  console.log('generateMonthOptions start:', start);
  console.log('generateMonthOptions endDate:', endDate);

  // Generate months up to endDate
  while (current <= endDate) {
    months.push(
      current.toLocaleString('default', { month: 'short', year: 'numeric' }),
    );
    current.setMonth(current.getMonth() + 1);
  }

  console.log('generateMonthOptions months:', months);
  return months;
};

export const MonitorModal = ({
  add,
  isAdding,
  unitName,
  unitType,
  activeMonth,
  currentValue,
  fiscalYear,
  startDate,
  onClose,
  handleSubmission,
}) => {
  const theme = useTheme();
  const currentMonth = new Date().toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });
  const monthOptions = generateMonthOptions(startDate, fiscalYear);
  console.log('Month Options:', monthOptions);
  console.log('Active year:', fiscalYear);
  console.log('Start date:', startDate);
  console.log('Current month:', currentMonth);

  // Set default month to currentMonth if in monthOptions, else activeMonth, else first option or empty
  const defaultMonth =
    monthOptions.includes(currentMonth) && !activeMonth
      ? currentMonth
      : activeMonth && monthOptions.includes(activeMonth)
        ? activeMonth
        : monthOptions[0] || '';

  const formik = useFormik({
    initialValues: {
      actual_value: currentValue || '',
      month: defaultMonth,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmission({
        actual_value: values.actual_value,
        month: values.month,
      });
    },
  });

  return (
    <React.Fragment>
      <Dialog open={add} onClose={onClose}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 2,
            backgroundColor: theme.palette.grey[50],
          }}
        >
          <DialogTitle variant="h4" color={theme.palette.text.primary}>
            {unitName ? `${unitName} Monitoring` : 'Monitoring'} ({unitType})
          </DialogTitle>
          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Box>

        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Typography
              variant="subtitle1"
              color={theme.palette.text.primary}
              sx={{
                margin: '16px 0',
                textAlign: 'center',
                padding: '10px 20px',
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.grey[50],
              }}
            >
              You are monitoring{' '}
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: theme.palette.primary.main,
                  margin: 2,
                }}
              >
                {formik.values.month || 'select a month'}
              </span>{' '}
              activities
            </Typography>

            <FormControl
              fullWidth
              error={formik.touched.month && Boolean(formik.errors.month)}
              sx={{ marginTop: 1 }}
            >
              <Autocomplete
                id="month"
                options={monthOptions}
                value={formik.values.month || null}
                onChange={(event, newValue) => {
                  formik.setFieldValue('month', newValue || '');
                }}
                onBlur={() => formik.setFieldTouched('month', true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Month"
                    error={formik.touched.month && Boolean(formik.errors.month)}
                    helperText={formik.touched.month && formik.errors.month}
                  />
                )}
                noOptionsText="No months available"
                fullWidth
              />
            </FormControl>

            <FormControl
              fullWidth
              error={
                formik.touched.actual_value &&
                Boolean(formik.errors.actual_value)
              }
              sx={{ marginTop: 3 }}
            >
              <InputLabel htmlFor="actual_value">Actual Value</InputLabel>
              <OutlinedInput
                id="actual_value"
                name="actual_value"
                label="Actual Value"
                value={formik.values.actual_value}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                type="number"
              />
              {formik.touched.actual_value && formik.errors.actual_value && (
                <FormHelperText
                  error
                  id="standard-weight-helper-text-actual_value"
                >
                  {formik.errors.actual_value}
                </FormHelperText>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ paddingX: 2 }}>
            <Button onClick={onClose} sx={{ marginLeft: 10 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ paddingX: 6, boxShadow: 0, borderRadius: 2 }}
              disabled={isAdding}
            >
              {isAdding ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                'Submit'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
};

MonitorModal.propTypes = {
  add: PropTypes.bool,
  isAdding: PropTypes.bool,
  unitName: PropTypes.string,
  unitType: PropTypes.string,
  activeMonth: PropTypes.string,
  currentValue: PropTypes.string,
  fiscalYear: PropTypes.string,
  startDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  onClose: PropTypes.func,
  handleSubmission: PropTypes.func,
};
