import React from 'react';
import { TableRow, TableCell, Box, Typography } from '@mui/material';

const ReportTableEmpty = ({ colSpan, hasSearch }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No reports found
        </Typography>
        {hasSearch && (
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        )}
      </Box>
    </TableCell>
  </TableRow>
);

export default ReportTableEmpty;
