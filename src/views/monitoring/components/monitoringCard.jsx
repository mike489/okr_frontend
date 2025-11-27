
import React from 'react';
import { Card, Box,  Typography } from '@mui/material';



function MonitoringCard({ actualValue, month }) {
  
  return (
    <Card className="w-full max-w-md">
      <Box className="flex items-center justify-between p-4 bg-gray-100 rounded-t-lg">
        <Typography  className="text-xl font-bold">Monthly Actual Values</Typography>
      </Box>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{actualValue}</div>
            <div className="text-sm text-gray-500">{month}</div>
          </div>
        </div>
      </Card>
    </Card>
  );
}

export default MonitoringCard;