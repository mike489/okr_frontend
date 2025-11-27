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
    <Box mb={0}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body1"
        
        dangerouslySetInnerHTML={{ __html: value || '-' }}
        sx={{ wordBreak: 'break-word', textTransform: 'capitalize', fontWeight: 500 }}
      />
    </Box>
  );
  const DetailGridItem = ({ label, value, xs = 6, sx = {} }) => (
    <Grid item xs={xs}>
      <DetailItem label={label} value={value} sx={sx} />
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
              <TableCell sx={{ fontWeight: 700 }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Activity Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Place</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Creator</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Status
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
                   <Typography variant="body2">
                      {report?.task}
                    </Typography>
                    {/* <Typography
                      variant="body2"
                      color="text.secondary"
                      dangerouslySetInnerHTML={{
                        __html: report?.summary || '-',
                      }}
                    /> */}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report?.activity_type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report?.start_date} to {report?.end_date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      dangerouslySetInnerHTML={{ __html: report?.place || '-' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{report?.creator}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={statusInfo.label}
                      size="small"
                      sx={{
                        bgcolor: statusInfo.color,
                        color: theme.palette.getContrastText(statusInfo.color),
                        fontWeight: 600,
                        minWidth: 80,
                      }}
                    />
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
            <Chip
              label={getStatusInfo(selectedReport?.status).label}
              size="small"
              sx={{
                ml: 2,
                bgcolor: 'background.paper',
                color: getStatusInfo(selectedReport?.status).color,
                fontWeight: 600,
                border: `1px solid ${getStatusInfo(selectedReport?.status).color}`,
              }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedReport && (
            <Grid container>
              {/* Left Column - Report Details */}
              <Grid item xs={12} md={6} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#000"
                    sx={{ mb: 0 }}
                  >
                    Activity Information
                  </Typography>
                 <Box sx={{borderBottom:1, mb:2, borderBottomColor:'text.secondary'}} />

                  <Grid container spacing={1}>
                       <DetailGridItem
                      label="Task"
                      value={selectedReport.task}
                    />
                    <DetailGridItem
                      label="Activity"
                      value={selectedReport.activity}
                    />
                    <DetailGridItem
                      label="Type"
                      value={selectedReport.activity_type}
                    />
                    <DetailGridItem
                      label="Period"
                      value={`${selectedReport.start_date} to ${selectedReport.end_date}`}
                    />
                    <DetailGridItem
                      label="Location"
                      value={selectedReport.place}
                    />
                    <DetailGridItem
                      label="Objective"
                      value={selectedReport.objective}
                      xs={12}
                      sx={{ whiteSpace: 'pre-line' }}
                    />
                    <DetailGridItem
                      label="Participants"
                      value={selectedReport.participants}
                    />
                  </Grid>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#000"
                    sx={{ mb: 0 }}
                  >
                    Report Content
                  </Typography>
                  <Box sx={{borderBottom:1, mb:2, borderBottomColor:'text.secondary'}} />

                  <DetailItem label="Summary" value={selectedReport.summary} />
                  {selectedReport.summary_in_amharic && (
                    <DetailItem
                      label="Summary (Amharic)"
                      value={selectedReport.summary_in_amharic}
                      sx={{ direction: 'rtl' }}
                    />
                  )}
                  <DetailItem
                    label="Deliverables"
                    value={selectedReport.deliverables}
                  />
                </Box>

                {selectedReport.remarks?.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#000"
                      sx={{ mb: 0 }}
                    >
                      Previous Remarks
                    </Typography>
                   <Box sx={{borderBottom:1, mb:2, borderBottomColor:'text.secondary'}} />

                    <Stack spacing={2}>
                      {selectedReport.remarks.map((remark, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 2,
                            // bgcolor: 'action.hover',
                            // borderLeft: `3px solid ${theme.palette.primary.main}`,
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-line' }}
                          >
                            {remark.remark}
                          </Typography>
                          {remark.created_at && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              mt={1}
                              display="block"
                            >
                              {new Date(remark.created_at).toLocaleString()}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Grid>

              {/* Right Column - Media and Actions */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'background.default'
                      : 'grey.50',
                  p: 3,
                  borderLeft: { md: `1px solid ${theme.palette.divider}` },
                }}
              >
                {/* Photo Gallery */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#000"
                    sx={{ mb: 0 }}
                  >
                    Media Evidence
                  </Typography>
                  <Box sx={{borderBottom:1, mb:2, borderBottomColor:'text.secondary'}} />

                  {selectedReport.photos?.length > 0 ? (
                    <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                      {selectedReport.photos.map((photo, index) => (
                        <ImageListItem
                          key={index}
                          sx={{ borderRadius: 1, overflow: 'hidden' }}
                        >
                          <img
                            src={photo.url}
                            alt={`Evidence ${index + 1}`}
                            loading="lazy"
                            style={{
                              cursor: 'pointer',
                              aspectRatio: '1/1',
                              objectFit: 'cover',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.03)',
                              },
                            }}
                            onClick={() => {
                              setSelectedImage(photo.url);
                              setOpenImageModal(true);
                            }}
                            onError={(e) => {
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 150,
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <IconPhoto
                        size={32}
                        color={theme.palette.text.disabled}
                      />
                      <Typography variant="body2" color="text.disabled" mt={1}>
                        No photos available
                      </Typography>
                    </Box>
                  )}
                </Box>
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
