import React from 'react';
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
  Box,
  LinearProgress,
  Pagination,
  Stack,
  useTheme,
} from '@mui/material';
import ReportTableRow from './ReportTableRow';
import ReportTableLoading from './ReportTableLoading';
import ReportTableEmpty from './ReportTableEmpty';
import { useProgressIndicator } from 'hooks/useProgressIndicator';
// import { useProgressIndicator } from '../hooks/useProgressIndicator';

const ReportTable = ({
  reports,
  loading,
  search,
  pagination,
  onRowClick,
  onPageChange,
}) => {
  const { getProgressColor, getProgressLabel } = useProgressIndicator();
  const theme = useTheme();

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
          position: 'relative',
          minHeight: reports.length === 0 && loading ? 200 : 'auto',
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
            {loading ? (
              <ReportTableLoading colSpan={5} />
            ) : reports.length === 0 ? (
              <ReportTableEmpty colSpan={5} hasSearch={!!search} />
            ) : (
              reports.map((report, index) => (
                <ReportTableRow
                  key={index}
                  report={report}
                  onClick={onRowClick}
                  getProgressColor={getProgressColor}
                  getProgressLabel={getProgressLabel}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
            onChange={onPageChange}
            color="primary"
            disabled={loading}
            sx={{ '& .MuiPaginationItem-root': { borderRadius: 1 } }}
          />
        </Stack>
      )}
    </>
  );
};

export default ReportTable;
