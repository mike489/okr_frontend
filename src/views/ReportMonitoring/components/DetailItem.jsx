import React from 'react';
import { Box, Typography } from '@mui/material';

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

export default DetailItem;
