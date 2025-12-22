import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Divider,
  Box,
  LinearProgress,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import { IconInfoCircle, IconChartBar } from '@tabler/icons-react';
import DetailItem from './DetailItem';
import { useProgressIndicator } from 'hooks/useProgressIndicator';

const ReportDetailModal = ({ open, report, onClose }) => {
  const theme = useTheme();
  const { getProgressColor, getProgressLabel } = useProgressIndicator();
  if (!report) return null;

  const progressColor = getProgressColor(report.progress || 0);
  const progressLabel = getProgressLabel(report.progress || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          boxShadow: theme.shadows[24],
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconInfoCircle size={24} />
          <Typography variant="h6" fontWeight={600} color={'white'}>
            Activity Details
          </Typography>
          <Chip
            label={progressLabel}
            size="small"
            sx={{
              ml: 2,
              bgcolor: 'background.paper',
              color: progressColor,
              fontWeight: 600,
            }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DetailItem label="Unit" value={report.assigned_to} />
              <DetailItem label="Key Result" value={report.key_result} />
              <DetailItem label="Fiscal Year" value={report.fiscal_year} />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Progress Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {report.progress || 0}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={report.progress || 0}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 2,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: progressColor,
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconChartBar size={20} color={theme.palette.primary.main} />
                  <Typography variant="body2">{progressLabel}</Typography>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>

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
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 1 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailModal;
