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
  Alert,
} from '@mui/material';
import { IconTrashFilled, IconX, IconPlus } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

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
  unit_id: Yup.string().required('Unit is required'),
  notes: Yup.string().optional(),
  months: Yup.array()
    .of(
      Yup.object().shape({
        key_result_id: Yup.string().required('Key Result ID is required'),
        objective_name: Yup.string().required('Objective name is required'),
        months: Yup.array()
          .of(
            Yup.object().shape({
              month_name: Yup.string().required('Month is required'),
              target: Yup.number()
                .required('Target is required')
                .min(0, 'Target cannot be negative'),
            }),
          )
          .min(1, 'At least one month is required')
          .required('Months are required')
          .test(
            'unique-months',
            'Duplicate months are not allowed',
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

const Distribute = ({
  create,
  isCreating,
  unit = [],
  keyResults = [],
  fiscalYearId,
  onClose,
  handleSubmission,
}) => {
  // Find objective name for a key result
  const getObjectiveName = (keyResultId) => {
    const keyResult = keyResults.find((kr) => kr.id === keyResultId);
    if (keyResult?.objective_name) return keyResult.objective_name;
    if (keyResult?.objective?.name) return keyResult.objective.name;
    if (keyResult?.objective?.title) return keyResult.objective.title;
    if (keyResult?.parent_objective) return keyResult.parent_objective;
    return '';
  };

  // Get the selected key result (should be only one)
  const selectedKeyResult = keyResults.length > 0 ? keyResults[0] : null;

  React.useEffect(() => {
    if (create && selectedKeyResult) {
      // Initialize form with the selected key result
      const initialMonths = [
        {
          key_result_id: selectedKeyResult.id,
          objective_name: getObjectiveName(selectedKeyResult.id) || '',
          months: [{ month_name: '', target: 0 }],
        },
      ];

      formik.setValues({
        months: initialMonths,
        unit_id: '',
        notes: '',
        fiscal_year_id: fiscalYearId || '',
      });
    }
  }, [create, selectedKeyResult]);

  const formik = useFormik({
    initialValues: {
      months: [],
      unit_id: '',
      notes: '',
      fiscal_year_id: fiscalYearId || '',
    },
    validationSchema,
    onSubmit: (values) => {
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
      };
      console.log('Submitted payload:', formattedValues);
      handleSubmission(formattedValues);
    },
  });

  // Handle objective name change
  const handleObjectiveNameChange = (keyResultIndex, value) => {
    const newMonths = [...formik.values.months];
    newMonths[keyResultIndex] = {
      ...newMonths[keyResultIndex],
      objective_name: value,
    };
    formik.setFieldValue('months', newMonths);
  };

  // Handle month selection
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

  // Handle target value change
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

  // Add a new month
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

  // Remove a month
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
      formik.values.unit_id &&
      formik.values.months.length > 0 &&
      formik.values.months.every(
        (monthGroup) =>
          monthGroup.key_result_id &&
          monthGroup.objective_name &&
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
          //   px: 3,
          py: 1,
        }}
      >
        <DialogTitle variant="h4" sx={{ fontWeight: 'bold' }}>
          Distribute Key Result
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="close">
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Show selected key result info */}
          {selectedKeyResult && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Distributing:{' '}
                {selectedKeyResult.title ||
                  selectedKeyResult.name ||
                  'Key Result'}
              </Typography>
            </Alert>
          )}

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
          {/* Unit Selection */}
          <FormControl
            fullWidth
            error={formik.touched.unit_id && Boolean(formik.errors.unit_id)}
            sx={{ mb: 3 }}
          >
            <InputLabel id="unit-label">Unit *</InputLabel>
            <Select
              labelId="unit-label"
              id="unit-select"
              name="unit_id"
              value={formik.values.unit_id}
              label="Unit *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={unit?.length === 0}
            >
              {unit?.length === 0 ? (
                <MenuItem disabled>Loading units...</MenuItem>
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
          {/* Months and Targets Section */}
          {formik.values.months?.length > 0 && (
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
                Monthly Targets
              </Typography>

              {formik.values.months.map((monthGroup, keyResultIndex) => {
                const keyResult = keyResults.find(
                  (kr) => kr.id === monthGroup.key_result_id,
                );
                const monthData = monthGroup.months;

                return (
                  <Box
                    key={`key-result-${keyResultIndex}`}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'grey.200',
                      borderRadius: 1,
                    }}
                  >
                    {/* Objective Name Input */}
                    <TextField
                      fullWidth
                      label="Objective Name *"
                      value={monthGroup.objective_name || ''}
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
                                m.month_name === monthName && i !== monthIndex,
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
                                Month *
                              </InputLabel>
                              <Select
                                labelId={`month-label-${keyResultIndex}-${monthIndex}`}
                                id={`month-select-${keyResultIndex}-${monthIndex}`}
                                value={month.month_name || ''}
                                label="Month *"
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
                                          i === monthIndex ? true : false,
                                        target: i === monthIndex ? true : false,
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
                              label="Target *"
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
                                        i === monthIndex ? true : false,
                                      target: i === monthIndex ? true : false,
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
            {isCreating ? 'Distributing...' : 'Distribute'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// PropTypes for type checking
Distribute.propTypes = {
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
  fiscalYearId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default Distribute;
