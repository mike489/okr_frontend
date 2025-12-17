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
  MenuItem,
  Select,
  Typography,
  TextField,
  Stack,
  Tooltip,
} from '@mui/material';
import { IconTrashFilled, IconX, IconPlus } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Autocomplete } from '@mui/material';
import { bgcolor } from '@mui/system';
import { color } from 'highcharts';

// List of months
const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Yup validation schema
const validationSchema = Yup.object().shape({
  plans: Yup.array()
    .of(Yup.string().required('Activity ID is required'))
    .min(1, 'At least one activity is required')
    .required('Main Activities are required'),
  unit_id: Yup.string().required('Unit is required'),
  fiscal_year_id: Yup.string().required('Fiscal year is required'),
  months: Yup.array()
    .of(
      Yup.object().shape({
        activity_id: Yup.string().required('Activity ID is required'),
        months: Yup.array()
          .of(
            Yup.object().shape({
              month_name: Yup.string().required('Month is required'),
              target: Yup.number()
                .required('Target is required')
                .min(0, 'Target cannot be negative'),
            }),
          )
          .min(1, 'At least one month is required per activity')
          .required('Months are required')
          .test(
            'unique-months',
            'Duplicate months are not allowed within an activity',
            (months) => {
              const monthNames = months.map((m) => m.month_name);
              return new Set(monthNames).size === monthNames.length;
            },
          ),
      }),
    )
    .min(1, 'At least one activity with months is required')
    .required('Months and targets are required'),
});

const CreatePlan = ({
  create,
  isCreating,
  unit = [],
  activities = [],
  fiscalYearId,
  onClose,
  handleSubmission,
}) => {
  const formik = useFormik({
    initialValues: {
      plans: [],
      months: [],
      unit_id: '',
      fiscal_year_id: fiscalYearId || '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Map months to the new plans structure
      const formattedValues = {
        plans: values.months.map((m) => ({
          id: m.activity_id,
          months: m.months.map((month) => ({
            month_name: month.month_name || '',
            target: month.target || 0,
          })),
        })),
        unit_id: values.unit_id,
        fiscal_year_id: values.fiscal_year_id,
      };
      console.log('Submitted payload:', formattedValues); // Debug
      handleSubmission(formattedValues);
    },
  });

  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!create) {
      formik.resetForm();
    }
  }, [create]);

  // Handle activity selection
  const handleActivityChange = (event, newValue) => {
    const newPlans = newValue.map((activity) => activity.id);
    const newMonths = newPlans.map((planId) => {
      const existing = formik.values.months.find(
        (m) => m.activity_id === planId,
      );
      return (
        existing || {
          activity_id: planId,
          months: [{ month_name: '', target: 0 }],
        }
      );
    });

    formik.setFieldValue('plans', newPlans);
    formik.setFieldValue('months', newMonths);
  };

  // Handle month selection for an activity
  const handleMonthChange = (activityIndex, monthIndex, value) => {
    const newMonths = [...formik.values.months];
    newMonths[activityIndex] = {
      ...newMonths[activityIndex],
      months: [
        ...newMonths[activityIndex].months.slice(0, monthIndex),
        {
          ...newMonths[activityIndex].months[monthIndex],
          month_name: value,
        },
        ...newMonths[activityIndex].months.slice(monthIndex + 1),
      ],
    };
    console.log('Updated months state:', newMonths); // Debug
    formik.setFieldValue('months', newMonths);
  };

  // Handle target value change for a month
  const handleTargetChange = (activityIndex, monthIndex, value) => {
    const newMonths = [...formik.values.months];
    newMonths[activityIndex] = {
      ...newMonths[activityIndex],
      months: [
        ...newMonths[activityIndex].months.slice(0, monthIndex),
        {
          ...newMonths[activityIndex].months[monthIndex],
          target: Number(value),
        },
        ...newMonths[activityIndex].months.slice(monthIndex + 1),
      ],
    };
    console.log('Updated target state:', newMonths); // Debug
    formik.setFieldValue('months', newMonths);
  };

  // Add a new month to an activity
  const addMonth = (activityIndex) => {
    const newMonths = [...formik.values.months];
    newMonths[activityIndex] = {
      ...newMonths[activityIndex],
      months: [
        ...newMonths[activityIndex].months,
        { month_name: '', target: 0 },
      ],
    };
    formik.setFieldValue('months', newMonths);
  };

  // Remove a month from an activity
  const removeMonth = (activityIndex, monthIndex) => {
    const newMonths = [...formik.values.months];
    newMonths[activityIndex] = {
      ...newMonths[activityIndex],
      months: newMonths[activityIndex].months.filter(
        (_, i) => i !== monthIndex,
      ),
    };
    if (newMonths[activityIndex].months.length === 0) {
      newMonths[activityIndex].months.push({ month_name: '', target: 0 });
    }
    formik.setFieldValue('months', newMonths);
  };

  // Validate form for submission
  const isFormValid = () => {
    return (
      formik.values.plans.length > 0 &&
      formik.values.unit_id &&
      formik.values.months.length === formik.values.plans.length &&
      formik.values.months.every(
        (monthGroup) =>
          monthGroup.activity_id &&
          monthGroup.months.length > 0 &&
          monthGroup.months.every(
            (month) =>
              month.month_name && month.target !== '' && month.target >= 0,
          ),
      )
    );
  };

  return (
    <Dialog
      open={create}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: { xs: '90vw', sm: '600px' },
          maxWidth: '800px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1,
        }}
      >
        <DialogTitle variant="h4" sx={{ fontWeight: 'bold' }}>
          Distribute My Main Activities
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="close">
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Unit Selection */}
          <FormControl
            fullWidth
            error={formik.touched.unit_id && Boolean(formik.errors.unit_id)}
            sx={{ mb: 3 }}
          >
            <InputLabel id="unit-label">Unit</InputLabel>
            <Select
              labelId="unit-label"
              id="unit-select"
              name="unit_id"
              value={formik.values.unit_id}
              label="Unit"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {unit?.length === 0 ? (
                <MenuItem disabled>No units available</MenuItem>
              ) : (
                unit.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {formik.touched.unit_id && formik.errors.unit_id}
            </FormHelperText>
          </FormControl>
          {/* Main Activities Autocomplete */}
          <Autocomplete
            multiple
            id="plans"
            options={activities}
            getOptionLabel={(option) => {
              if (!option) return '';
              if (option.title) return option.title;
              if (Array.isArray(option.main_activity)) {
                return option.main_activity
                  .map((active) =>
                    typeof active === 'string' ? active : active?.title,
                  )
                  .filter(Boolean)
                  .join(', ');
              }
              if (typeof option.main_activity === 'string')
                return option.main_activity;
              return '';
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={activities.filter((a) => formik.values.plans.includes(a.id))}
            onChange={handleActivityChange}
            onBlur={() => formik.setTouched({ ...formik.touched, plans: true })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Main Activities"
                name="plans"
                error={formik.touched.plans && Boolean(formik.errors.plans)}
                helperText={formik.touched.plans && formik.errors.plans}
              />
            )}
            sx={{ mb: 4 }}
          />

          {/* Months and Targets Section */}
          {formik.values.plans?.length > 0 && (
            <Box
              sx={{
                mb: 4,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Months and Targets
              </Typography>
              <Stack spacing={3}>
                {formik.values.plans.map((planId, activityIndex) => {
                  const activity = activities.find((a) => a.id === planId);
                  const monthData = formik.values.months.find(
                    (m) => m.activity_id === planId,
                  )?.months || [{ month_name: '', target: 0 }];

                  return (
                    <Box
                      key={`activity-${planId}`}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'grey.200',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, fontWeight: 'bold' }}
                      >
                        {activity?.title ||
                          activity?.main_activity ||
                          'Unknown Activity'}
                      </Typography>
                      <Stack spacing={2}>
                        {monthData.map((month, monthIndex) => {
                          // Filter out months selected in other entries for this activity
                          const availableMonths = monthOptions.filter(
                            (monthName) =>
                              !monthData.some(
                                (m, i) =>
                                  m.month_name === monthName &&
                                  i !== monthIndex,
                              ),
                          );

                          return (
                            <Box
                              key={`month-${activityIndex}-${monthIndex}`}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                  xs: '1fr',
                                  sm: '1fr 1fr auto',
                                },
                                gap: 2,
                                alignItems: 'center',
                              }}
                            >
                              <FormControl
                                fullWidth
                                error={
                                  formik.touched.months?.[activityIndex]
                                    ?.months?.[monthIndex]?.month_name &&
                                  Boolean(
                                    formik.errors.months?.[activityIndex]
                                      ?.months?.[monthIndex]?.month_name,
                                  )
                                }
                              >
                                <InputLabel
                                  id={`month-label-${activityIndex}-${monthIndex}`}
                                  shrink={!!month.month_name} // Ensure label shrinks when a month is selected
                                >
                                  Month
                                </InputLabel>
                                <Select
                                  labelId={`month-label-${activityIndex}-${monthIndex}`}
                                  id={`month-select-${activityIndex}-${monthIndex}`}
                                  value={month.month_name || ''}
                                  label="Month"
                                  onChange={(e) =>
                                    handleMonthChange(
                                      activityIndex,
                                      monthIndex,
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() => {
                                    const newTouched = [
                                      ...(formik.touched.months || []),
                                    ];
                                    newTouched[activityIndex] = {
                                      ...newTouched[activityIndex],
                                      months: new Array(monthData.length)
                                        .fill()
                                        .map((_, i) => ({
                                          month_name:
                                            i === monthIndex
                                              ? true
                                              : newTouched[activityIndex]
                                                ?.months?.[i]?.month_name ||
                                              false,
                                          target:
                                            i === monthIndex
                                              ? true
                                              : newTouched[activityIndex]
                                                ?.months?.[i]?.target ||
                                              false,
                                        })),
                                    };
                                    formik.setTouched({
                                      ...formik.touched,
                                      months: newTouched,
                                    });
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>Select a month</em>
                                  </MenuItem>
                                  {availableMonths.map((monthName) => (
                                    <MenuItem key={monthName} value={monthName}>
                                      {monthName}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText>
                                  {formik.touched.months?.[activityIndex]
                                    ?.months?.[monthIndex]?.month_name &&
                                    formik.errors.months?.[activityIndex]
                                      ?.months?.[monthIndex]?.month_name}
                                </FormHelperText>
                              </FormControl>
                              <TextField
                                fullWidth
                                label="Target"
                                type="number"
                                value={month.target || ''}
                                onChange={(e) =>
                                  handleTargetChange(
                                    activityIndex,
                                    monthIndex,
                                    e.target.value,
                                  )
                                }
                                onBlur={() => {
                                  const newTouched = [
                                    ...(formik.touched.months || []),
                                  ];
                                  newTouched[activityIndex] = {
                                    ...newTouched[activityIndex],
                                    months: new Array(monthData.length)
                                      .fill()
                                      .map((_, i) => ({
                                        month_name:
                                          i === monthIndex
                                            ? true
                                            : newTouched[activityIndex]
                                              ?.months?.[i]?.month_name ||
                                            false,
                                        target:
                                          i === monthIndex
                                            ? true
                                            : newTouched[activityIndex]
                                              ?.months?.[i]?.target || false,
                                      })),
                                  };
                                  formik.setTouched({
                                    ...formik.touched,
                                    months: newTouched,
                                  });
                                }}
                                error={
                                  formik.touched.months?.[activityIndex]
                                    ?.months?.[monthIndex]?.target &&
                                  Boolean(
                                    formik.errors.months?.[activityIndex]
                                      ?.months?.[monthIndex]?.target,
                                  )
                                }
                                helperText={
                                  formik.touched.months?.[activityIndex]
                                    ?.months?.[monthIndex]?.target &&
                                  formik.errors.months?.[activityIndex]
                                    ?.months?.[monthIndex]?.target
                                }
                              />
                              {monthData.length > 1 && (
                                <Tooltip title="Remove Month">
                                  <IconButton
                                    onClick={() => removeMonth(activityIndex, monthIndex)}
                                    aria-label="remove month"
                                    sx={{ color: 'error.main' }}
                                  >
                                    <IconTrashFilled size={20} />
                                  </IconButton>
                                </Tooltip>
                              )}

                            </Box>
                          );
                        })}
                        <Tooltip
                          title={
                            monthData.length >= 12
                              ? 'Maximum 12 months reached'
                              : 'Add another month'
                          }
                        >
                          <span>
                            <Button
                              variant="outlined"
                              startIcon={<IconPlus size={18} />}
                              onClick={() => addMonth(activityIndex)}
                              disabled={monthData.length >= 12}
                              sx={{ mt: 1, alignSelf: 'flex-start' }}
                            >
                              Add Month
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}


        </DialogContent>

        {/* Form Actions */}
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}
        >
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || !isFormValid()}
            startIcon={
              isCreating ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : null
            }
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// PropTypes for type checking
CreatePlan.propTypes = {
  create: PropTypes.bool.isRequired,
  isCreating: PropTypes.bool.isRequired,
  unit: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      // Support both legacy and new shapes
      title: PropTypes.string,
      main_activity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({ title: PropTypes.string }),
          ]),
        ),
      ]),
    }),
  ).isRequired,

  fiscalYearId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default CreatePlan;
