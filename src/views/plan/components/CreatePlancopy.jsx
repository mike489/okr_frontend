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
    .of(Yup.string().required('Key Result ID is required'))
    .min(1, 'At least one key result is required')
    .required('Key Results are required'),
  unit_id: Yup.string().required('Unit is required'),
  notes: Yup.string().optional(),
  // fiscal_year_id: Yup.string().required('Fiscal year is required'),
  months: Yup.array()
    .of(
      Yup.object().shape({
        key_result_id: Yup.string().required('Key Result ID is required'), // Changed from activity_id
        objective_name: Yup.string().required('Objective name is required'), // Add objective_name validation
        months: Yup.array()
          .of(
            Yup.object().shape({
              month_name: Yup.string().required('Month is required'),
              target: Yup.number()
                .required('Target is required')
                .min(0, 'Target cannot be negative'),
            }),
          )
          .min(1, 'At least one month is required per key result')
          .required('Months are required')
          .test(
            'unique-months',
            'Duplicate months are not allowed within a key result',
            (months) => {
              const monthNames = months.map((m) => m.month_name);
              return new Set(monthNames).size === monthNames.length;
            },
          ),
      }),
    )
    .min(1, 'At least one key result with months is required')
    .required('Months and targets are required'),
});

const CreatePlan = ({
  create,
  isCreating,
  unit = [],
  keyResults = [],
  // You might need to pass objectives or ensure keyResults have objective_name
  objectives = [], // Optional: if you need a separate objectives list
  fiscalYearId,
  onClose,
  handleSubmission,
}) => {
  // Find objective name for a key result
  const getObjectiveName = (keyResultId) => {
    const keyResult = keyResults.find((kr) => kr.id === keyResultId);
    // Check different possible property names for objective name
    if (keyResult?.objective_name) return keyResult.objective_name;
    if (keyResult?.objective?.name) return keyResult.objective.name;
    if (keyResult?.objective?.title) return keyResult.objective.title;
    if (keyResult?.parent_objective) return keyResult.parent_objective;
    return ''; // Return empty string if not found
  };

  const formik = useFormik({
    initialValues: {
      plans: [],
      months: [],
      unit_id: '',
      notes: '', // Add notes field
      fiscal_year_id: fiscalYearId || '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Map months to the new plans structure with objective_name
      const formattedValues = {
        plans: values.months.map((m) => ({
          id: m.key_result_id,
          objective_name:
            m.objective_name || getObjectiveName(m.key_result_id) || '',
          months: m.months.map((month) => ({
            month_name: month.month_name || '',
            target: month.target || 0,
          })),
        })),
        unit_id: values.unit_id,
        notes: values.notes || '',
        // Add assigned_to if needed - you might need to pass this as prop or get it from context
        // assigned_to: '019b3175-ebe3-7005-8a54-583ee2769ab9', // You'll need to get this value
      };
      console.log('Submitted payload:', formattedValues);
      handleSubmission(formattedValues);
    },
  });

  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!create) {
      formik.resetForm();
    }
  }, [create]);

  // Handle key result selection
  const handleKeyResultChange = (event, newValue) => {
    const newPlans = newValue.map((keyResult) => keyResult.id);
    const newMonths = newPlans.map((planId) => {
      const existing = formik.values.months.find(
        (m) => m.key_result_id === planId,
      );
      return (
        existing || {
          key_result_id: planId,
          objective_name: getObjectiveName(planId) || '', // Initialize with objective name
          months: [{ month_name: '', target: 0 }],
        }
      );
    });

    formik.setFieldValue('plans', newPlans);
    formik.setFieldValue('months', newMonths);
  };

  // Handle objective name change for a key result
  const handleObjectiveNameChange = (keyResultIndex, value) => {
    const newMonths = [...formik.values.months];
    newMonths[keyResultIndex] = {
      ...newMonths[keyResultIndex],
      objective_name: value,
    };
    formik.setFieldValue('months', newMonths);
  };

  // Handle month selection for a key result
  const handleMonthChange = (keyResultIndex, monthIndex, value) => {
    const newMonths = [...formik.values.months];
    newMonths[keyResultIndex] = {
      ...newMonths[keyResultIndex],
      months: [
        ...newMonths[keyResultIndex].months.slice(0, monthIndex),
        {
          ...newMonths[keyResultIndex].months[monthIndex],
          month_name: value,
        },
        ...newMonths[keyResultIndex].months.slice(monthIndex + 1),
      ],
    };
    formik.setFieldValue('months', newMonths);
  };

  // Handle target value change for a month
  const handleTargetChange = (keyResultIndex, monthIndex, value) => {
    const newMonths = [...formik.values.months];
    newMonths[keyResultIndex] = {
      ...newMonths[keyResultIndex],
      months: [
        ...newMonths[keyResultIndex].months.slice(0, monthIndex),
        {
          ...newMonths[keyResultIndex].months[monthIndex],
          target: Number(value),
        },
        ...newMonths[keyResultIndex].months.slice(monthIndex + 1),
      ],
    };
    formik.setFieldValue('months', newMonths);
  };

  // Add a new month to a key result
  const addMonth = (keyResultIndex) => {
    const newMonths = [...formik.values.months];
    newMonths[keyResultIndex] = {
      ...newMonths[keyResultIndex],
      months: [
        ...newMonths[keyResultIndex].months,
        { month_name: '', target: 0 },
      ],
    };
    formik.setFieldValue('months', newMonths);
  };

  // Remove a month from a key result
  const removeMonth = (keyResultIndex, monthIndex) => {
    const newMonths = [...formik.values.months];
    newMonths[keyResultIndex] = {
      ...newMonths[keyResultIndex],
      months: newMonths[keyResultIndex].months.filter(
        (_, i) => i !== monthIndex,
      ),
    };
    if (newMonths[keyResultIndex].months.length === 0) {
      newMonths[keyResultIndex].months.push({ month_name: '', target: 0 });
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
          monthGroup.key_result_id &&
          monthGroup.objective_name && // Check objective_name is present
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
          Distribute My Key Results
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="close">
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
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
                Array.isArray(unit) &&
                unit.map((unitItem) => (
                  <MenuItem key={unitItem.id} value={unitItem.id}>
                    {unitItem.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {formik.touched.unit_id && formik.errors.unit_id}
            </FormHelperText>
          </FormControl>

          {/* Notes Field */}
          <TextField
            fullWidth
            label="Notes (Optional)"
            name="notes"
            multiline
            rows={2}
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            sx={{ mb: 3 }}
          />

          {/* Key Results Autocomplete */}
          <Autocomplete
            multiple
            id="key-results"
            options={keyResults}
            getOptionLabel={(option) => {
              if (!option) return '';
              if (option.title) return option.title;
              if (option.name) return option.name;
              if (option.description) return option.description;
              return '';
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={keyResults.filter((kr) =>
              formik.values.plans.includes(kr.id),
            )}
            onChange={handleKeyResultChange}
            onBlur={() => formik.setTouched({ ...formik.touched, plans: true })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Key Results"
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
                {formik.values.plans.map((planId, keyResultIndex) => {
                  const keyResult = keyResults.find((kr) => kr.id === planId);
                  const monthData = formik.values.months.find(
                    (m) => m.key_result_id === planId,
                  )?.months || [{ month_name: '', target: 0 }];

                  const currentObjectiveName =
                    formik.values.months.find((m) => m.key_result_id === planId)
                      ?.objective_name ||
                    getObjectiveName(planId) ||
                    '';

                  return (
                    <Box
                      key={`key-result-${planId}`}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'grey.200',
                        borderRadius: 1,
                      }}
                    >
                      {/* Key Result Title */}
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 1, fontWeight: 'bold' }}
                      >
                        {keyResult?.title ||
                          keyResult?.name ||
                          keyResult?.description ||
                          'Unknown Key Result'}
                      </Typography>

                      {/* Objective Name Input */}
                      <TextField
                        fullWidth
                        label="Objective Name *"
                        value={currentObjectiveName}
                        onChange={(e) =>
                          handleObjectiveNameChange(
                            keyResultIndex,
                            e.target.value,
                          )
                        }
                        onBlur={() => {
                          const newTouched = [...(formik.touched.months || [])];
                          newTouched[keyResultIndex] = {
                            ...newTouched[keyResultIndex],
                            objective_name: true,
                          };
                          formik.setTouched({
                            ...formik.touched,
                            months: newTouched,
                          });
                        }}
                        error={
                          formik.touched.months?.[keyResultIndex]
                            ?.objective_name &&
                          Boolean(
                            formik.errors.months?.[keyResultIndex]
                              ?.objective_name,
                          )
                        }
                        helperText={
                          formik.touched.months?.[keyResultIndex]
                            ?.objective_name &&
                          formik.errors.months?.[keyResultIndex]?.objective_name
                        }
                        sx={{ mb: 2 }}
                      />

                      <Stack spacing={2}>
                        {monthData.map((month, monthIndex) => {
                          // Filter out months selected in other entries for this key result
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
                              key={`month-${keyResultIndex}-${monthIndex}`}
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
                                  formik.touched.months?.[keyResultIndex]
                                    ?.months?.[monthIndex]?.month_name &&
                                  Boolean(
                                    formik.errors.months?.[keyResultIndex]
                                      ?.months?.[monthIndex]?.month_name,
                                  )
                                }
                              >
                                <InputLabel
                                  id={`month-label-${keyResultIndex}-${monthIndex}`}
                                  shrink={!!month.month_name}
                                >
                                  Month
                                </InputLabel>
                                <Select
                                  labelId={`month-label-${keyResultIndex}-${monthIndex}`}
                                  id={`month-select-${keyResultIndex}-${monthIndex}`}
                                  value={month.month_name || ''}
                                  label="Month"
                                  onChange={(e) =>
                                    handleMonthChange(
                                      keyResultIndex,
                                      monthIndex,
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() => {
                                    const newTouched = [
                                      ...(formik.touched.months || []),
                                    ];
                                    newTouched[keyResultIndex] = {
                                      ...newTouched[keyResultIndex],
                                      months: new Array(monthData.length)
                                        .fill()
                                        .map((_, i) => ({
                                          month_name:
                                            i === monthIndex
                                              ? true
                                              : newTouched[keyResultIndex]
                                                  ?.months?.[i]?.month_name ||
                                                false,
                                          target:
                                            i === monthIndex
                                              ? true
                                              : newTouched[keyResultIndex]
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
                                  {formik.touched.months?.[keyResultIndex]
                                    ?.months?.[monthIndex]?.month_name &&
                                    formik.errors.months?.[keyResultIndex]
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
                                    keyResultIndex,
                                    monthIndex,
                                    e.target.value,
                                  )
                                }
                                onBlur={() => {
                                  const newTouched = [
                                    ...(formik.touched.months || []),
                                  ];
                                  newTouched[keyResultIndex] = {
                                    ...newTouched[keyResultIndex],
                                    months: new Array(monthData.length)
                                      .fill()
                                      .map((_, i) => ({
                                        month_name:
                                          i === monthIndex
                                            ? true
                                            : newTouched[keyResultIndex]
                                                ?.months?.[i]?.month_name ||
                                              false,
                                        target:
                                          i === monthIndex
                                            ? true
                                            : newTouched[keyResultIndex]
                                                ?.months?.[i]?.target || false,
                                      })),
                                  };
                                  formik.setTouched({
                                    ...formik.touched,
                                    months: newTouched,
                                  });
                                }}
                                error={
                                  formik.touched.months?.[keyResultIndex]
                                    ?.months?.[monthIndex]?.target &&
                                  Boolean(
                                    formik.errors.months?.[keyResultIndex]
                                      ?.months?.[monthIndex]?.target,
                                  )
                                }
                                helperText={
                                  formik.touched.months?.[keyResultIndex]
                                    ?.months?.[monthIndex]?.target &&
                                  formik.errors.months?.[keyResultIndex]
                                    ?.months?.[monthIndex]?.target
                                }
                              />
                              {monthData.length > 1 && (
                                <Tooltip title="Remove Month">
                                  <IconButton
                                    onClick={() =>
                                      removeMonth(keyResultIndex, monthIndex)
                                    }
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
                              onClick={() => addMonth(keyResultIndex)}
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
  keyResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      objective_name: PropTypes.string,
      objective: PropTypes.shape({
        name: PropTypes.string,
        title: PropTypes.string,
      }),
    }),
  ).isRequired,
  objectives: PropTypes.array,
  fiscalYearId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default CreatePlan;
