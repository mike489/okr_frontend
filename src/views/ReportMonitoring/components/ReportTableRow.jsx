import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  Box,
  LinearProgress,
  useTheme,
} from '@mui/material';

const ReportTableRow = ({
  report,
  onClick,
  getProgressColor,
  getProgressLabel,
}) => {
  const theme = useTheme();
  const progressColor = getProgressColor(report.progress || 0);
  const progressLabel = getProgressLabel(report.progress || 0);

  return (
    <TableRow
      hover
      onClick={() => onClick(report)}
      sx={{
        cursor: 'pointer',
        '&:last-child td, &:last-child th': { border: 0 },
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
        },
      }}
    >
      <TableCell component="th" scope="row" sx={{ py: 2 }}>
        <Typography variant="body2" fontWeight={500}>
          {report.assigned_to || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 2 }}>
        <Typography variant="body2">{report.key_result || 'N/A'}</Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            bgcolor: `${progressColor}15`,
            color: progressColor,
            fontWeight: 600,
            border: `1px solid ${progressColor}30`,
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default ReportTableRow;
