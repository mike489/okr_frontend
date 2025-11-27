import * as React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Typography,
  useTheme,
  Autocomplete,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

// Validation schema
const validationSchema = Yup.object().shape({
  actual_value: Yup.string().required('Evaluation value is required'),
  month: Yup.string().required('Month is required'),
});

// Function to generate month options from startDate or fiscalYear to current month
const generateMonthOptions = (startDate, fiscalYear) => {
  let start;
  const currentDate = new Date();

  if (startDate && !isNaN(new Date(startDate))) {
    start = new Date(startDate);
  } else if (typeof fiscalYear === 'string' && fiscalYear.includes('-')) {
    const [startYear] = fiscalYear.split('-').map(Number);
    if (!isNaN(startYear)) {
      start = new Date(startYear, 0, 1); // Fiscal year starts January 1
    }
  }

  if (!start || isNaN(start)) {
    console.warn('Invalid startDate or fiscalYear, using current year January 1');
    start = new Date(currentDate.getFullYear(), 0, 1);
  }

  const endDate = start > currentDate ? start : currentDate;

  const months = [];
  let current = new Date(start);

  while (current <= endDate) {
    months.push(
      current.toLocaleString('default', { month: 'short', year: 'numeric' }),
    );
    current.setMonth(current.getMonth() + 1);
  }

  return months;
};

// Convert "MMM YYYY" to "YYYY-MM"
const formatMonthForAPI = (month) => {
  if (!month) return '';
  const [monthStr, year] = month.split(' ');
  const monthNum = new Date(`${monthStr} 1, ${year}`).getMonth() + 1;
  return `${year}-${monthNum.toString().padStart(2, '0')}`; // e.g., "Mar 2025" -> "2025-03"
};

export const MonitorForm = ({
  open,
  isAdding,
  unitName,
  unitType,
  activeMonth,
  currentValue,
  fiscalYear,
  startDate,
  monitoringData,
  onClose,
  onMonthChange,
  handleSubmission,
}) => {
  const theme = useTheme();
  const currentMonth = new Date().toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });
  const monthOptions = generateMonthOptions(startDate, fiscalYear); // Or monitoringData.map(m => m.month) for restriction

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
    onSubmit: (values, { resetForm }) => {
      handleSubmission({
        actual_value: values.actual_value,
        month: formatMonthForAPI(values.month),
      });
      // Reset actual_value but keep the selected month
      resetForm({ values: { actual_value: '', month: values.month } });
    },
  });

  // Check if the selected month exists in monitoringData for button text
  const isUpdate = monitoringData?.some((m) => m.month === formik.values.month);

  React.useEffect(() => {
    if (open) {
      formik.setFieldValue('actual_value', currentValue || '');
      formik.setFieldValue('month', defaultMonth);
    }
  }, [open, currentValue, defaultMonth]);

  if (!open) return null;

  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper }}>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Box sx={{ padding: 2 }}>
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
                onMonthChange(newValue);
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
              formik.touched.actual_value && Boolean(formik.errors.actual_value)
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
              <FormHelperText error id="standard-weight-helper-text-actual_value">
                {formik.errors.actual_value}
              </FormHelperText>
            )}
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2, gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{ paddingX: 6, boxShadow: 0, borderRadius: 2, width: '100%' }}
            disabled={isAdding}
          >
            {isAdding ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : isUpdate ? (
              'Update'
            ) : (
              'Add'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

MonitorForm.propTypes = {
  open: PropTypes.bool,
  isAdding: PropTypes.bool,
  unitName: PropTypes.string,
  unitType: PropTypes.string,
  activeMonth: PropTypes.string,
  currentValue: PropTypes.string,
  fiscalYear: PropTypes.string,
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  monitoringData: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      actual_value: PropTypes.string,
    }),
  ),
  onClose: PropTypes.func,
  onMonthChange: PropTypes.func,
  handleSubmission: PropTypes.func,
};