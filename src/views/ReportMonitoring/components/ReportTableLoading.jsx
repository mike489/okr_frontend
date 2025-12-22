import React from 'react';
import { TableRow, TableCell, Box } from '@mui/material';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const ReportTableLoading = ({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 10 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <ActivityIndicator size={24} />
      </Box>
    </TableCell>
  </TableRow>
);

export default ReportTableLoading;
