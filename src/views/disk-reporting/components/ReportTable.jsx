import React, { useState } from 'react';
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
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  IconPhoto,
  IconCheck,
  IconInfoCircle,
  IconSend,
} from '@tabler/icons-react';
import PropTypes from 'prop-types';

const ReportTable = ({ reports }) => {
  const theme = useTheme();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('');
  const [loadingImages, setLoadingImages] = useState({});

  const FALLBACK_IMAGE = 'https://via.placeholder.com/150?text=Image+Not+Found';

  const handleImageClick = (url, e) => {
    e.stopPropagation();
    setSelectedImage(url);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setSelectedImage('');
  };

  const handleRowClick = (report) => {
    setSelectedReport(report);
    setOpenApprovalModal(true);
    setRemarks('');
    setActionType('');
  };

  const handleCloseApprovalModal = () => {
    setOpenApprovalModal(false);
    setSelectedReport(null);
    setRemarks('');
    setActionType('');
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'created':
        return { label: 'Pending', color: theme.palette.warning.main };
      case 'approved':
        return { label: 'Approved', color: theme.palette.success.main };
      case 'rejected':
        return { label: 'Rejected', color: theme.palette.error.main };
      default:
        return { label: status, color: theme.palette.info.main };
    }
  };

  const DetailItem = ({ label, value }) => (
    <Box mb={1}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        dangerouslySetInnerHTML={{ __html: value || '-' }}
        sx={{ wordBreak: 'break-word', textTransform: 'capitalize' }}
      />
    </Box>
  );

  const DetailGridItem = ({ label, value, xs = 6 }) => (
    <Grid item xs={xs}>
      <DetailItem label={label} value={value} />
    </Grid>
  );

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderBottom: 1, borderBottomColor: '#8E8E8E66' }}
      >
        <Table sx={{ width: '100%' }} aria-label="reports table">
          <TableHead
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f7fa',
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Executive Summary</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Introduction</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Performance Indicators</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Monthly Actions</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Budget Utilization
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports?.map((report) => {
              const statusInfo = getStatusInfo(report?.status);
              return (
                <TableRow
                  key={report.id}
                  hover
                  onClick={() => handleRowClick(report)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark' ? '#2c2c2c' : '#f9f9f9',
                    },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" dangerouslySetInnerHTML={{ __html: report?.executive_summary || '-' }} />
                    {/* <Typography
                      variant="body2"
                      color="text.secondary"
                      dangerouslySetInnerHTML={{
                        __html: report?.summary || '-',
                      }}
                    /> */}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" dangerouslySetInnerHTML={{ __html: report?.introduction || '-' }} />

                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report?.start_date} to {report?.end_date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      dangerouslySetInnerHTML={{ __html: report?.performance_indicators || '-' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" dangerouslySetInnerHTML={{ __html: report?.monthly_actions || '-' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" dangerouslySetInnerHTML={{ __html: report?.budget_utilization || '-' }} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Image Preview Modal */}
      <Modal
        open={openImageModal}
        onClose={handleCloseImageModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Box
          sx={{
            maxWidth: '90%',
            maxHeight: '90%',
            outline: 'none',
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <img
            src={selectedImage}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              display: 'block',
            }}
            onError={(e) => {
              e.target.src = FALLBACK_IMAGE;
            }}
          />
        </Box>
      </Modal>

      {/* Approval Modal */}
      <Dialog
        open={openApprovalModal}
        onClose={handleCloseApprovalModal}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: theme.shadows[24],
            overflow: 'hidden',
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            // bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconInfoCircle size={24} />
            <Typography variant="h3" fontWeight={600}>
              Report Review
            </Typography>
            {/* <Chip
              label={getStatusInfo(selectedReport?.status).label}
              size="small"
              sx={{
                ml: 2,
                bgcolor: 'background.paper',
                color: getStatusInfo(selectedReport?.status).color,
                fontWeight: 600,
                border: `1px solid ${getStatusInfo(selectedReport?.status).color}`,
              }}
            /> */}
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedReport && (
            <Grid container spacing={2} sx={{ p: 3 }}>
              {/* Section Title */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Activity Information
                </Typography>
                <Box sx={{ mt: 1, borderBottom: 1, borderBottomColor: "#000", mb: 2 }} />
              </Grid>

              {/* Executive Summary */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Executive Summary
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.executive_summary || '-' }}
                />
              </Grid>

              {/* Introduction */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Introduction
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.introduction || '-' }}
                />
              </Grid>

              {/* Performance Indicators */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Performance Indicators
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.performance_indicators || '-' }}
                />
              </Grid>

              {/* Period */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Period
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }} >
                  {selectedReport.start_date} to {selectedReport.end_date}
                </Typography>
              </Grid>

              {/* Monthly Actions */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Monthly Actions
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.monthly_actions || '-' }}
                />
              </Grid>

              {/* Budget Utilization */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Budget Utilization
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.budget_utilization || '-' }}
                />
              </Grid>

              {/* Challenges */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Challenges
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.challenges || '-' }}
                />
              </Grid>

              {/* Corrective Actions */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Corrective Actions
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.corrective_actions || '-' }}
                />
              </Grid>

              {/* Next Steps */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Next Steps
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.next_steps || '-' }}
                />
              </Grid>

              {/* Conclusion */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" >
                  Conclusion
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: selectedReport.conclusion || '-' }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {/* Dialog Footer */}
        <DialogActions
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={handleCloseApprovalModal}
            variant="text"
            color="inherit"
            sx={{
              borderRadius: 1,
              px: 3,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ReportTable.propTypes = {
  reports: PropTypes.array.isRequired,
  onStatusChange: PropTypes.func,
};

export default ReportTable;
