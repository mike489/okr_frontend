// components/CreateMonitoringModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Paper,
  Box,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import { Close, Save, Percent } from '@mui/icons-material';
import { toast } from 'react-toastify';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';

const CreateMonitoringModal = ({
  open,
  onClose,
  keyResult,
  unit,
  onSuccess,
}) => {
  const [monthlyValues, setMonthlyValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize monthly values when modal opens or keyResult changes
  useEffect(() => {
    if (keyResult?.months && Array.isArray(keyResult.months)) {
      const initialValues = {};
      keyResult.months.forEach((month) => {
        initialValues[month.month] = month.actual || 0;
      });
      setMonthlyValues(initialValues);
    }
  }, [keyResult]);

  const handleValueChange = (monthName, value) => {
    const numValue = parseFloat(value) || 0;
    setMonthlyValues((prev) => ({
      ...prev,
      [monthName]: numValue,
    }));
  };

  const calculatePercentage = (target, actual) => {
    if (!target || target === 0) return 0;
    return Math.round((actual / target) * 100 * 100) / 100; // Round to 2 decimal places
  };

  const handleSubmit = async () => {
    if (!keyResult) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = await GetToken();
      const apiUrl = Backend.pmsUrl(Backend.monitoring);

      // Prepare months data for submission
      const monthsData = Object.keys(monthlyValues).map((monthName) => ({
        month: monthName,
        actual_value: monthlyValues[monthName],
      }));

      const requestBody = {
        assignment_id: keyResult.assignment_id,
        months: monthsData,
      };

      console.log('Submitting:', requestBody);

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Monitoring data saved successfully!');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.message || 'Failed to save monitoring data');
        toast.error(result.message || 'Failed to save monitoring data');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
      toast.error(err.message || 'Network error occurred');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return '#4caf50'; // Green for high progress
    if (progress >= 75) return '#8bc34a'; // Light green
    if (progress >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red for low progress
  };

  // If no key result or no months, show nothing
  if (!keyResult) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Update Monitoring Data</Typography>
          <IconButton onClick={onClose} size="small" disabled={submitting}>
            <Close />
          </IconButton>
        </Box>
        {unit && (
          <Typography variant="subtitle2" color="textSecondary">
            {keyResult.key_result?.title} • {unit.name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" paragraph sx={{ mb: 3 }}>
          Update actual values for each month. Assignment ID:{' '}
          {keyResult.assignment_id}
        </Typography>

        {keyResult.months && keyResult.months.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Target
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Actual Value
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Percentage
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Progress
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keyResult.months.map((month, index) => {
                  const actualValue = monthlyValues[month.month] || 0;
                  const percentage = calculatePercentage(
                    month.target,
                    actualValue,
                  );

                  return (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {month.month}
                      </TableCell>
                      <TableCell align="center">{month.target}</TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={actualValue}
                          onChange={(e) =>
                            handleValueChange(month.month, e.target.value)
                          }
                          InputProps={{
                            inputProps: {
                              min: 0,
                              step: 0.01,
                            },
                          }}
                          disabled={submitting}
                          sx={{
                            width: '120px',
                            '& .MuiInputBase-input': {
                              textAlign: 'center',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Percent
                            sx={{ fontSize: 16, color: 'text.secondary' }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              color: getProgressColor(percentage),
                            }}
                          >
                            {percentage.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(percentage, 100)}
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProgressColor(percentage),
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: '40px',
                              fontWeight: 'medium',
                              color: getProgressColor(percentage),
                            }}
                          >
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ py: 4 }}
          >
            No monthly data available for this key result
          </Typography>
        )}

        {/* Summary Section */}
        {keyResult.months && keyResult.months.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">
                  Total Target
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {keyResult.months.reduce(
                    (sum, month) => sum + (month.target || 0),
                    0,
                  )}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">
                  Total Actual
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {Object.values(monthlyValues).reduce(
                    (sum, val) => sum + (val || 0),
                    0,
                  )}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">
                  Overall Progress
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="primary">
                  {calculatePercentage(
                    keyResult.months.reduce(
                      (sum, month) => sum + (month.target || 0),
                      0,
                    ),
                    Object.values(monthlyValues).reduce(
                      (sum, val) => sum + (val || 0),
                      0,
                    ),
                  ).toFixed(2)}
                  %
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={16} /> : <Save />}
          disabled={submitting || !keyResult?.months}
        >
          {submitting ? 'Saving...' : 'Save Monitoring Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMonitoringModal;
