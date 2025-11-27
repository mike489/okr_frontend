import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material';

const DrogaDonutChart = ({ value, size, frequency, color }) => {
  const theme = useTheme();

  // Chart dimensions
  const strokeWidth = 10;
  const radius = size && size > 0 ? size : 42;
  const normalizedRadius = radius - strokeWidth / 1.8;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Fixed calculation for stroke offset
  const progress = Math.min(Math.max(value, 0), 100); // Clamp between 0-100
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Font size for value (calculated), frequency (fixed)
  const valueFontSize = size && size > 0 ? size / 2.8 : 16;

  return (
    <div
      style={{
        height: radius * 2.4, 
        width: radius * 2.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={`Donut chart showing ${value}% for ${frequency || 'unknown'}`}
    >
      <svg height={radius * 2.4} width={radius * 2.2}>
        {/* Background Circle */}
        <circle
          stroke={theme.palette.grey[200]}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress Circle - Fixed implementation */}
        <circle
          stroke={progress > 0 ? color : theme.palette.grey[200]}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`} // Start from top
          style={{
            strokeOpacity: 1,
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />

        {/* Value Text */}
        <text
          x="50%"
          y="45%"
          dy=".3em"
          textAnchor="middle"
          fontSize={`${valueFontSize}px`}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          fill={theme.palette.text.primary}
        >
          {`${progress}%`}
        </text>

        {/* Frequency Text */}
        <text
          x="50%"
          y="60%"
          dy=".3em"
          textAnchor="middle"
          fontSize="12px"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          fill={theme.palette.text.primary}
        >
          {frequency}
        </text>
      </svg>
    </div>
  );
};

DrogaDonutChart.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.number,
  frequency: PropTypes.string,
  color: PropTypes.string,
};

DrogaDonutChart.defaultProps = {
  size: 40,
  frequency: '',
  color: '#2196F3'
};

export default DrogaDonutChart;