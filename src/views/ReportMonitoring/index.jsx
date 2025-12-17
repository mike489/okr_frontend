import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  useTheme,
  Box,
  Grid,
  Modal,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  TextField,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  IconSearch,
  IconRefresh,
  IconInfoCircle,
  IconChartBar,
  IconTrendingUp,
} from '@tabler/icons-react';
import PropTypes from 'prop-types';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import { toast } from 'react-toastify';

const ReportMonitoring = () => {
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  const handleFetchReports = async () => {
    setLoading(true);
    try {
      const token = await GetToken();
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString(),
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(
        `${Backend.pmsUrl(Backend.monitoringUpdate)}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setReports(data.data || []);
        // If API returns pagination data, update accordingly
        // Otherwise, calculate client-side
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total,
            total_pages:
              data.pagination.total_pages ||
              Math.ceil(data.pagination.total / prev.per_page),
          }));
        } else {
          setPagination((prev) => ({
            ...prev,
            total: data.data?.length || 0,
            total_pages: Math.ceil((data.data?.length || 0) / prev.per_page),
          }));
        }
      } else {
        toast.error(data.message || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error(err.message || 'An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchReports();
  }, [pagination.page, pagination.per_page]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchSubmit = () => {
    handleFetchReports();
  };

  const handleRefresh = () => {
    setSearch('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    handleFetchReports();
  };

  const handleRowClick = (report) => {
    setSelectedReport(report);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedReport(null);
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  const handlePerPageChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      per_page: parseInt(event.target.value),
      page: 1, // Reset to first page when changing items per page
    }));
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 75) return theme.palette.info.main;
    if (progress >= 50) return theme.palette.warning.main;
    if (progress >= 25) return theme.palette.secondary.main;
    return theme.palette.error.main;
  };

  const getProgressLabel = (progress) => {
    if (progress >= 100) return 'Completed';
    if (progress >= 75) return 'On Track';
    if (progress >= 50) return 'Moderate';
    if (progress >= 25) return 'Needs Attention';
    return 'Delayed';
  };

  const DetailItem = ({ label, value, sx = {} }) => (
    <Box mb={2}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          wordBreak: 'break-word',
          ...sx,
        }}
      >
        {value || '-'}
      </Typography>
    </Box>
  );

  const DetailGridItem = ({ label, value, xs = 6, sx = {} }) => (
    <Grid item xs={xs}>
      <DetailItem label={label} value={value} sx={sx} />
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={600}>
            Report Monitoring Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              color="primary"
              sx={{
                borderRadius: 1,
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <IconRefresh size={20} />
            </IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Search and Filters */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by unit, activity, or key result..."
            value={search}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
            size="small"
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <IconSearch
                  size={20}
                  style={{
                    marginRight: 8,
                    color: theme.palette.text.secondary,
                  }}
                />
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearchSubmit}
            disabled={loading}
            sx={{ borderRadius: 1 }}
          >
            Search
          </Button>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={pagination.per_page}
              label="Per Page"
              onChange={handlePerPageChange}
              disabled={loading}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead
            sx={{
              bgcolor:
                theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                Key Result / Activity
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Fiscal Year</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }} align="center">
                Progress
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }} align="center">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      No reports found
                    </Typography>
                    {search && (
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report, index) => {
                const progressColor = getProgressColor(report.progress || 0);
                const progressLabel = getProgressLabel(report.progress || 0);

                return (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => handleRowClick(report)}
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'action.hover'
                            : 'grey.50',
                      },
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ py: 2 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {report.assigned_to || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2">
                        {report.key_result || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={report.fiscal_year || '2024/2025'}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={report.progress || 0}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: progressColor,
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: progressColor, minWidth: 40 }}
                        >
                          {report.progress || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Chip
                        label={progressLabel}
                        size="small"
                        sx={{
                          bgcolor: `${progressColor}15`, // 15% opacity
                          color: progressColor,
                          fontWeight: 600,
                          border: `1px solid ${progressColor}30`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {reports.length > 0 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {(pagination.page - 1) * pagination.per_page + 1} to{' '}
            {Math.min(pagination.page * pagination.per_page, pagination.total)}{' '}
            of {pagination.total} entries
          </Typography>
          <Pagination
            count={pagination.total_pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            disabled={loading}
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1,
              },
            }}
          />
        </Stack>
      )}

      {/* Summary Stats */}
      {/* {reports.length > 0 && (
        <Paper sx={{ p: 2, mt: 3, borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {reports.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Activities
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {reports.filter((r) => (r.progress || 0) >= 100).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {
                    reports.filter(
                      (r) => (r.progress || 0) >= 50 && (r.progress || 0) < 100,
                    ).length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {reports.filter((r) => (r.progress || 0) < 50).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Needs Attention
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )} */}

      {/* Detail Modal */}
      <Dialog
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: theme.shadows[24],
          },
        }}
      >
        {selectedReport && (
          <>
            <DialogTitle
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                py: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconInfoCircle size={24} />
                <Typography variant="h6" fontWeight={600}>
                  Activity Details
                </Typography>
                <Chip
                  label={getProgressLabel(selectedReport.progress || 0)}
                  size="small"
                  sx={{
                    ml: 2,
                    bgcolor: 'background.paper',
                    color: getProgressColor(selectedReport.progress || 0),
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Left Column - Basic Info */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <DetailItem
                      label="Unit"
                      value={selectedReport.assigned_to}
                    />
                    <DetailItem
                      label="Key Result"
                      value={selectedReport.key_result}
                    />
                    <DetailItem
                      label="Fiscal Year"
                      value={selectedReport.fiscal_year}
                    />
                  </Box>
                </Grid>

                {/* Right Column - Progress */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      Progress Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 3 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Completion Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedReport.progress || 0}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={selectedReport.progress || 0}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getProgressColor(
                              selectedReport.progress || 0,
                            ),
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconChartBar
                          size={20}
                          color={theme.palette.primary.main}
                        />
                        <Typography variant="body2">
                          {getProgressLabel(selectedReport.progress || 0)}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>

              {/* Additional Information Section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No additional information available for this activity.
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
              <Button
                onClick={handleCloseDetailModal}
                variant="contained"
                sx={{ borderRadius: 1 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

ReportMonitoring.propTypes = {};

export default ReportMonitoring;
