// UnitTable.js - Now using separate modal component
import React, { useState } from 'react';
import {
  Button,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  LinearProgress,
  useTheme,
  Stack,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import CreateMonitoringModal from './CreateMonitoringModal';
// import CreateMonitoringModal from './CreateMonitoringModal';

const UnitTable = ({ units, onUpdate }) => {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleRowClick = (unitId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleMonitorClick = (keyResult, unit) => {
    setSelectedKeyResult(keyResult);
    setSelectedUnit(unit);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedKeyResult(null);
    setSelectedUnit(null);
  };

  const handleSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateOverallProgress = (keyResults) => {
    if (!keyResults || keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce(
      (sum, kr) => sum + (kr.progress || 0),
      0,
    );
    return Math.round(totalProgress / keyResults.length);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.palette.success.main;
    if (progress >= 50) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          minHeight: '66dvh',
          border: 0.4,
          borderColor: theme.palette.divider,
          borderRadius: 2,
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="Units table">
          <TableHead>
            <TableRow>
              <TableCell>Unit Details</TableCell>
              <TableCell>Unit Type</TableCell>
              <TableCell>Total Key Results</TableCell>
              <TableCell>Overall Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(units) && units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No units found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : Array.isArray(units) ? (
              units.map((item) => (
                <React.Fragment key={item.id}>
                  {/* Main Row - Unit Details */}
                  <TableRow
                    sx={{
                      backgroundColor: expandedRows[item.id]
                        ? theme.palette.grey[50]
                        : 'inherit',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => handleRowClick(item.id)}
                        >
                          {expandedRows[item.id] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {item.unit?.name || 'Unnamed Unit'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Created: {formatDate(item.unit?.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<Business />}
                        label={item.unit?.unit_type?.name || 'No Type'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<Assessment />}
                        label={`${item.key_results?.length || 0} Key Results`}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {calculateOverallProgress(item.key_results)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={calculateOverallProgress(item.key_results)}
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 1,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getProgressColor(
                                calculateOverallProgress(item.key_results),
                              ),
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRowClick(item.id)}
                        startIcon={
                          expandedRows[item.id] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )
                        }
                      >
                        {expandedRows[item.id] ? 'Hide' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row - Key Results List */}
                  {expandedRows[item.id] &&
                    item.key_results &&
                    item.key_results.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{
                            py: 3,
                            backgroundColor: theme.palette.grey[50],
                          }}
                        >
                          <Collapse
                            in={expandedRows[item.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ pl: 6, pr: 2 }}>
                              <Stack spacing={1}>
                                {item.key_results.map((keyResult, index) => (
                                  <Paper
                                    key={keyResult.assignment_id || index}
                                    sx={{
                                      p: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      backgroundColor: 'white',
                                      border: `1px solid ${theme.palette.divider}`,
                                      borderRadius: 1,
                                      '&:hover': {
                                        backgroundColor:
                                          theme.palette.action.hover,
                                      },
                                    }}
                                  >
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        gutterBottom
                                      >
                                        {keyResult.key_result?.title ||
                                          'Untitled Key Result'}
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 2,
                                        }}
                                      >
                                        <Chip
                                          label={`Progress: ${keyResult.progress}%`}
                                          size="small"
                                          sx={{
                                            backgroundColor: getProgressColor(
                                              keyResult.progress,
                                            ),
                                            color: 'white',
                                          }}
                                        />
                                        {/* <Typography
                                          variant="caption"
                                          color="textSecondary"
                                        >
                                          Assignment ID:{' '}
                                          {keyResult.assignment_id?.slice(-8) ||
                                            'N/A'}
                                        </Typography> */}
                                      </Box>
                                    </Box>

                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() =>
                                        handleMonitorClick(keyResult, item.unit)
                                      }
                                      startIcon={<TrendingUp />}
                                      sx={{ ml: 2 }}
                                    >
                                      Monitor
                                    </Button>
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}

                  {/* Expanded Row - No Key Results */}
                  {expandedRows[item.id] &&
                    (!item.key_results || item.key_results.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{
                            py: 3,
                            backgroundColor: theme.palette.grey[50],
                          }}
                        >
                          <Collapse
                            in={expandedRows[item.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ pl: 6, textAlign: 'center', py: 4 }}>
                              <Assessment
                                sx={{
                                  fontSize: 48,
                                  color: 'text.secondary',
                                  mb: 2,
                                }}
                              />
                              <Typography
                                variant="body1"
                                color="textSecondary"
                                gutterBottom
                              >
                                No key results assigned to this unit
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                Assign Key Results
                              </Button>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="error">
                    Invalid data format
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Monitoring Modal */}
      <CreateMonitoringModal
        open={modalOpen}
        onClose={handleCloseModal}
        keyResult={selectedKeyResult}
        unit={selectedUnit}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default UnitTable;
