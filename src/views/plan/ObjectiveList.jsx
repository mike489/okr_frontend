import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Box,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Tooltip,
  TableSortLabel,
  Button,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import { DotMenu } from 'ui-component/menu/DotMenu';
import hasPermission from 'utils/auth/hasPermission';
import KeyResultModal from 'views/key_results/components/KeyResultForm';
import { toast } from 'react-toastify';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import Distribute from './components/Distribute';
import { useSelector } from 'react-redux';

const ObjectiveList = ({ data, onEdit, onDelete, tenant, onRefresh }) => {
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState(null);
  const [units, setUnits] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleClick = (objective) => {
    setSelectedObjective(objective);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedObjective(null);
  };

  const handleOpenEditModal = () => {
    if (onEdit && selectedObjective) {
      onEdit(selectedObjective);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (onDelete && selectedObjective) {
      onDelete(selectedObjective);
    }
    handleClose();
  };

  const toggleRowExpansion = (objectiveId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [objectiveId]: !prev[objectiveId],
    }));
  };

  // Handle opening the Add Key Result modal
  const handleOpenAddKeyResultModal = (objective) => {
    setSelectedObjective(objective);
    setAddModal(true);
  };

  // Handle closing the Add Key Result modal
  const handleCloseAddKeyResultModal = () => {
    setAddModal(false);
    setSelectedObjective(null);
  };

  // Calculate total weight of key results
  const calculateTotalWeight = (keyResults) => {
    return keyResults?.reduce((sum, kr) => sum + (kr.weight || 0), 0) || 0;
  };

  // Get progress for display
  const getProgressDisplay = (keyResults) => {
    if (!keyResults || keyResults.length === 0) return 'No KRs';

    const totalProgress = keyResults.reduce(
      (sum, kr) => sum + (kr.progress || 0),
      0,
    );
    return Math.round(totalProgress / keyResults.length);
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'success';
    if (progress >= 40) return 'warning';
    return 'error';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 7) return 'success';
    if (confidence >= 5) return 'warning';
    return 'error';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Format value based on metric unit
  const formatValue = (value, unit) => {
    if (unit === '%' || unit === 'USD') {
      return unit === 'USD' ? `$${value.toLocaleString()}` : `${value}%`;
    }
    return value;
  };

  const defaultFormValues = {
    objective_id: selectedObjective?.id || '',
    name: '',
    metric_unit: '%',
    target_type: 'decrease_to',
    start_value: 0,
    current_value: 0,
    target_value: 0,
    weight: 0,
  };

  const handleAddKeyResult = async (values, { setSubmitting, resetForm }) => {
    setActionLoading(true);
    try {
      const token = await GetToken();
      const response = await fetch(Backend.pmsUrl(Backend.keyResults), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          ...values,
          tenant_id: tenant,
          objective_id: selectedObjective?.id,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Key Result added successfully');
        handleCloseAddKeyResultModal();
        onRefresh && onRefresh();
        resetForm();
      } else {
        toast.error(data.message || 'Failed to add key result');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
      setSubmitting(false);
    }
  };

  const handleFetchingUnits = async () => {
    const token = await GetToken();
    const Api = Backend.pmsUrl(Backend.myUnits);

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setUnits(response.data.data || []);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
      });
  };

  const handleDistributionSubmit = async (value) => {
    setIsCreating(true);
    const token = await GetToken();
    const Api = Backend.pmsUrl(Backend.okrDistribute);

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      if (!selectedYear?.id) {
        toast.error(
          'Please select a fiscal year before distributing objectives',
        );
        setIsCreating(false);
        return;
      }

      const data = {
        assigned_to: value.unit_id,
        key_results: value.plans.map((plan) => ({
          id: plan.id,
          objective_name: plan.objective_name,
          months: plan.months.map((month) => ({
            month_name: month.month_name,
            target: month.target,
          })),
        })),
        notes: value.notes || 'Increase sales by 10%',
        fiscal_year_id: selectedYear.id,
        fiscal_year_name: selectedYear.year,
      };

      console.log('Sending payload:', JSON.stringify(data, null, 2));

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response?.success) {
        toast.success(
          response?.data?.message ||
            `Objective assigned successfully for ${selectedYear.year}.`,
        );
        handleCloseDistributeModal();
        onRefresh && onRefresh();
      } else {
        // Check if error is related to fiscal year
        const errorMessage =
          response?.data?.message || 'Failed to assign objective.';

        if (
          errorMessage.toLowerCase().includes('fiscal') ||
          errorMessage.toLowerCase().includes('year')
        ) {
          toast.error(`Fiscal year error: ${errorMessage}`);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error in objective addition:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDistributeModal = (keyResult) => {
    setSelectedKeyResult(keyResult);
    setDistributeModalOpen(true);
    handleFetchingUnits();
  };

  const handleCloseDistributeModal = () => {
    setDistributeModalOpen(false);
    setSelectedKeyResult(null);
  };

  useEffect(() => {
    handleFetchingUnits();
  }, []);

  return (
    <>
      <Paper sx={{ minHeight: '66dvh', overflow: 'hidden' }}>
        <TableContainer sx={{ width: '100%' }}>
          <Table sx={{ maxWidth: '100%', borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    background: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    padding: '12px 16px',
                    width: '50px',
                  }}
                >
                  {/* Empty column for expand/collapse icon */}
                </TableCell>
                {[
                  { key: 'title', label: 'Title' },
                  { key: 'description', label: 'Description' },
                  { key: 'type', label: 'Type' },
                  { key: 'visibility', label: 'Visibility' },
                  { key: 'status', label: 'Status' },
                  { key: 'key_results', label: 'Key Results' },
                  { key: 'progress', label: 'Progress' },
                ].map((header) => (
                  <TableCell
                    key={header.key}
                    sx={{
                      background: theme.palette.grey[100],
                      color: theme.palette.text.primary,
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      padding: '12px 16px',
                      '&:not(:last-of-type)': {
                        borderRight: `1px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === header.key}
                      direction={
                        sortConfig.key === header.key
                          ? sortConfig.direction
                          : 'asc'
                      }
                      onClick={() => handleSort(header.key)}
                    >
                      {header.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    background: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    padding: '12px 16px',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((objective) => {
                const progress = getProgressDisplay(objective.key_results);
                const isExpanded = expandedRows[objective.id];

                return (
                  <React.Fragment key={objective.id}>
                    {/* Main Objective Row */}
                    <TableRow
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.grey[50],
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.grey[100],
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleRowExpansion(objective.id)}
                    >
                      <TableCell sx={{ padding: '12px 16px', width: '50px' }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(objective.id);
                          }}
                        >
                          {isExpanded ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        <Typography variant="subtitle3" fontWeight="medium">
                          {objective.title}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        <Typography variant="body2" color="text.secondary">
                          {objective.description || 'No description'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        <Chip
                          label={objective.type}
                          size="small"
                          color={
                            objective.type === 'Company'
                              ? 'primary'
                              : 'secondary'
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        <Chip
                          label={objective.visibility}
                          size="small"
                          color={
                            objective.visibility === 'Public'
                              ? 'success'
                              : 'warning'
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        <Chip
                          label={objective.status}
                          size="small"
                          color={
                            objective.status === 'active'
                              ? 'success'
                              : 'default'
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        <Box>
                          <Typography variant="body2">
                            {objective.key_results?.length || 0} KRs
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total weight:{' '}
                            {calculateTotalWeight(objective.key_results)}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ padding: '12px 16px' }}>
                        {objective.key_results?.length > 0 ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                color={getProgressColor(progress)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                              {progress}%
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No KRs
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell
                        sx={{ padding: '12px 16px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DotMenu
                          onOpen={() => handleClick(objective)}
                          onClose={() => handleClose()}
                          onEdit={
                            hasPermission('update:objective')
                              ? () => handleOpenEditModal()
                              : null
                          }
                          onDelete={
                            hasPermission('delete:objective')
                              ? () => handleDelete()
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row for Key Results */}
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        sx={{
                          padding: 0,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          backgroundColor: theme.palette.grey[50],
                        }}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            {objective.key_results?.length > 0 ? (
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Box
                                  sx={{
                                    p: 2,
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      handleOpenAddKeyResultModal(objective)
                                    }
                                  >
                                    Add Key Result
                                  </Button>
                                </Box>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 'bold' }}>
                                        Key Result
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Metric
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Start
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Current
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Target
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Progress
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Weight
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Confidence
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        Action
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {objective.key_results.map((kr) => (
                                      <TableRow key={kr.id}>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {kr.name}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={kr.metric_unit}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          {formatValue(
                                            kr.start_value,
                                            kr.metric_unit,
                                          )}
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography fontWeight="medium">
                                            {formatValue(
                                              kr.current_value,
                                              kr.metric_unit,
                                            )}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            color="primary"
                                            fontWeight="bold"
                                          >
                                            {formatValue(
                                              kr.target_value,
                                              kr.metric_unit,
                                            )}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {kr.target_type.replace('_', ' ')}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                            }}
                                          >
                                            <Box sx={{ flexGrow: 1 }}>
                                              <LinearProgress
                                                variant="determinate"
                                                value={kr.progress}
                                                color={getProgressColor(
                                                  kr.progress,
                                                )}
                                                sx={{
                                                  height: 6,
                                                  borderRadius: 3,
                                                }}
                                              />
                                            </Box>
                                            <Typography variant="body2">
                                              {kr.progress}%
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={`${kr.weight}%`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <Tooltip
                                            title={`Confidence: ${kr.confidence}/10`}
                                          >
                                            <Chip
                                              label={`${kr.confidence}/10`}
                                              size="small"
                                              color={getConfidenceColor(
                                                kr.confidence,
                                              )}
                                            />
                                          </Tooltip>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => {
                                              handleOpenDistributeModal(kr);
                                            }}
                                          >
                                            Distribute
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleOpenAddKeyResultModal(objective)
                                  }
                                >
                                  Add Key Result
                                </Button>
                                <Typography
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  No Key Results defined for this objective
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Key Result Modal */}
      {addModal && selectedObjective && (
        <KeyResultModal
          open={addModal}
          onClose={handleCloseAddKeyResultModal}
          initialValues={{
            ...defaultFormValues,
            objective_id: selectedObjective.id,
          }}
          onSubmit={handleAddKeyResult}
          loading={actionLoading}
          title="Add Key Result"
          submitButtonText="Add Key Result"
        />
      )}

      {distributeModalOpen && (
        <Distribute
          create={distributeModalOpen}
          isCreating={isCreating}
          unit={units.data || []}
          keyResults={selectedKeyResult ? [selectedKeyResult] : []}
          fiscalYearId={selectedYear.id}
          onClose={handleCloseDistributeModal}
          handleSubmission={handleDistributionSubmit}
        />
      )}
    </>
  );
};

export default ObjectiveList;
