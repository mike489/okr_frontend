import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import DrogaDonutChart from 'ui-component/charts/DrogaDonutChart';
import PropTypes from 'prop-types';

const PerformanceCard = ({ isEvaluated, performance, size, scale, color, frequency, onPress }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 2, cursor: 'pointer' }}
      onClick={onPress}
    >
      <DrogaDonutChart value={performance} size={size} color={color} frequency={frequency} />
      {isEvaluated ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">{scale}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        </Box>
      )}
    </Box>
  );
};

PerformanceCard.propTypes = {
  isEvaluated: PropTypes.bool,
  performance: PropTypes.number,
  frequency: PropTypes.string,
  onPress: PropTypes.func
};

export default PerformanceCard;
