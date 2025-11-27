import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';

export const PeriodTabs = ({ periodOptions, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(periodOptions[0].value);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    onTabChange(tabValue);
  };

  return (
    <Box display="flex" gap={1}>
      {periodOptions.map((period) => (
        <Chip
          key={period.value}
          label={period.name}
          onClick={() => handleTabChange(period.value)}
          color={activeTab === period.value ? 'primary' : 'default'}
          variant={activeTab === period.value ? 'filled' : 'outlined'}
        />
      ))}
    </Box>
  );
};
