import React, { useState } from 'react';
import {
  Button,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  styled,
  Box,
  CircularProgress,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { IconTarget, IconX } from '@tabler/icons-react';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import '@fontsource/inter';

// Custom styled components for modern UI
const RadiatingStepIcon = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '0.6rem',
  height: '0.6rem',
  marginRight: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary?.main || '#10b981',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `pulse 1.5s infinite`,
  '@keyframes pulse': {
    '0%': { boxShadow: `0 0 0 0 ${theme.palette.secondary?.light || '#10b981'}50` },
    '70%': { boxShadow: `0 0 0 10px ${theme.palette.secondary?.light || '#10b981'}00` },
    '100%': { boxShadow: `0 0 0 0 ${theme.palette.secondary?.light || '#10b981'}00` },
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  justifyContent: 'center',
  alignSelf: 'center',
  width: 1000,
  // width:'100%',
  border: `1px solid ${theme.palette.divider || '#e0e0e0'}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  background: theme.palette.background?.paper || '#ffffff',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background 0.2s ease',
  '&:hover': {
    background: theme.palette.action?.hover || '#f5f5f5',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  padding: '6px 16px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transform: 'translateY(-1px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 6,
    background: theme.palette.background?.default || '#f8fafc',
  },
  '& .MuiInputBase-input': {
    padding: '6px 12px',
    fontSize: '0.85rem',
  },
}));

const PlanTable = ({
  hideActions,
  plans,
  unitName,
  unitType,
  fiscalYear,
  onRefresh,
}) => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);
  console.log("Selected Months:", selectedMonths);
  const [actualValues, setActualValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute effective fiscal year
  const effectiveFiscalYear =
    fiscalYear && /^\d{4}-\d{4}$/.test(fiscalYear)
      ? fiscalYear
      : selectedYear && /^\d{4}-\d{4}$/.test(selectedYear)
        ? selectedYear
        : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const handleRowClick = (activity) => {
    if (!activity?.plans?.[0]?.id) {
      toast.error('Invalid plan ID for activity');
      return;
    }
    setSelectedRow(activity);
    const selectedPlanData = {
      planId: activity.plans[0].id,
      title: activity.title,
      target: activity.target,
      weight: activity.weight,
      unique_name: activity.unique_name,
    };
    setSelectedPlan(selectedPlanData);
  };

  const submitMonitoringData = async () => {
    if (!selectedPlan) {
      toast.error('No activity selected for monitoring');
      return;
    }
    const monitoring = Object.entries(actualValues)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([month, value]) => ({
        month,
        actual_value: String(value),
      }));
    if (monitoring.length === 0) {
      toast.error('At least one actual value is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await GetToken();
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const payload = {
        plan_id: selectedPlan.planId,
        monitoring,
      };
      const response = await fetch(`${Backend.api}${Backend.childMonitoring}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success('Monitoring data saved successfully');
        setActualValues({});
        onRefresh();
        handleCloseDialog();
      } else {
        throw new Error(data.message || 'Failed to save monitoring data');
      }
    } catch (error) {
      console.error('Request Error:', error);
      toast.error(`Failed to save monitoring data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActualValueChange = (month, value) => {
    setActualValues((prev) => ({
      ...prev,
      [month]: value,
    }));
  };



  const handleOpenDialog = (activity, months) => {
    handleRowClick(activity);

    if (activity?.plans?.[0]?.id) {
      // 🔹 Preload actual values for each month if available
      const initialValues = months.reduce((acc, month) => {
        acc[month.month_name] = month.actual_value ?? '';
        return acc;
      }, {});
      setActualValues(initialValues);

      setSelectedMonths(months);
      setOpenDialog(true);
    } else {
      toast.error('Cannot open dialog: Invalid plan ID');
    }
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMonths([]);
    setSelectedPlan(null);
    setSelectedRow(null);
    setActualValues({});
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ px: { xs: 2, md: 0 }, width: '100%', py: 2, bgcolor: 'background.default' }}>
      <ToastContainer />
      <StyledTableContainer>
        <Table size="medium" sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1rem' }}>Main Activity</TableCell>
              <TableCell align="center" sx={{ width: 120, fontSize: '1rem' }}>
                Weight
              </TableCell>
              <TableCell align="center" sx={{ width: 120, fontSize: '1rem' }}>
                Target
              </TableCell>
              <TableCell sx={{ fontSize: '1rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconTarget size={20} />
                  Month Targets
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(plans) && plans.length > 0 ? (
              plans.flatMap((item) =>
                item.main_activities?.map((activity) => (
                  <StyledTableRow
                    key={activity.id}
                    onClick={() => handleRowClick(activity)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                      >
                        {/* <RadiatingStepIcon component="span" /> */}
                        {activity.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{activity?.weight ?? '-'}</TableCell>
                    <TableCell align="center">{activity?.target ?? '-'}</TableCell>
                    <TableCell>
                      <StyledButton
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<IconTarget size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(
                            activity,
                            activity.plans?.flatMap((plan) => plan.months_target) || [],
                          );
                        }}
                      >
                        Monitor
                      </StyledButton>
                    </TableCell>
                  </StyledTableRow>
                )) || [],
              )
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">No activities found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Month Targets Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: `1px solid #e0e0e0`,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconTarget size={24} color="#1e3a8a" />
            <Typography variant="h5">Month Targets</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedMonths.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
              mb: 2,
            }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid #e5e7eb',
                  px: 3,
                  py: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Main Activity
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {selectedPlan?.title || 'No Plan Selected'}
                  </Typography>
                </Box>

                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={() => toast.info('Upload feature coming soon')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    textTransform: 'none',
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  Upload Files
                </StyledButton>
              </Box>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Month</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Actual Value</TableCell>
                    <TableCell>Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedMonths.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell>{month.month_name}</TableCell>
                      <TableCell>{month.target ?? '-'}</TableCell>
                      <TableCell>
                        <StyledTextField
                          size="small"
                          type="number"
                          value={actualValues[month.month_name] || ''}
                          onChange={(e) =>
                            handleActualValueChange(month.month_name, e.target.value)
                          }
                          disabled={isSubmitting}
                          InputProps={{
                            endAdornment: isSubmitting && <CircularProgress size={16} />,
                          }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell >
                        <Box sx={{ bgcolor: month.color, width: 70, color: "white", borderRadius: 2, textAlign: 'center', p: 1 }}>
                          {typeof month?.percentage === 'number' ? month.percentage.toFixed(2) : '-'}

                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No month targets available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <StyledButton
            onClick={handleCloseDialog}
            variant="outlined"
            color="primary"
            disabled={isSubmitting}
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={submitMonitoringData}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            Save
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

PlanTable.propTypes = {
  hideActions: PropTypes.bool,
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      objective: PropTypes.string,
      unit: PropTypes.string,
      weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      target: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      startDate: PropTypes.string,
      indicators: PropTypes.arrayOf(PropTypes.object),
      main_activities: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          title: PropTypes.string,
          weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          target: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          type: PropTypes.string,
          plans: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.string,
              parent_id: PropTypes.string,
              months_target: PropTypes.arrayOf(
                PropTypes.shape({
                  month_name: PropTypes.string,
                  target: PropTypes.number,
                }),
              ),
              fiscal_year: PropTypes.string,
              unit: PropTypes.string,
            }),
          ),
        }),
      ),
    }),
  ),
  unitName: PropTypes.string,
  unitType: PropTypes.string,
  fiscalYear: PropTypes.string,
  onRefresh: PropTypes.func,
};

export default PlanTable;