import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { IconTargetArrow, IconCalendarWeek } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const PlanCard = ({ data }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderRadius: '16px',
        height: '100%',
        width: '100%',
        transition: 'all 0.3s ease-in-out',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FF 100%)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        position: 'relative',
      }}
    >
      {/* Highlight bar */}
      <Box
        className="highlight-bar"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '0px',
          height: '100%',
          background: 'linear-gradient(to bottom, #5E6FC0, #3A4A9F)',
          transition: 'all 0.3s ease-in-out',
          opacity: 0,
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <Box paddingX={3} paddingTop={3} position="relative">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ mr: 2, borderRadius: '14px' }}>
            <IconCalendarWeek size={52} color="#5E6FC0" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              // variant="body"
              sx={{
                fontWeight: 500,
                color: '#272727',
                lineHeight: 1.3,
                fontSize: {
                  xs: '16px',
                 
                  
                },
              }}
            >
              {data.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#818181',
                fontFamily: 'Inter, sans-serif',
                mt: 0.5,
                fontSize: {
                  xs: '14px',
                  
                },
              }}
            >
              {data.initiative}
            </Typography>
          </Box>
        </Box>

       
      </Box>

      {/* Stats footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          // bgcolor: '#FAFAFA',
          paddingX: 3,
          paddingY: 1,
         
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          position: 'relative',
        }}
      >
        {/* Weight */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5,
            }}
          >
            
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: {
                xs: '14px',
                sm: '16px',
              },
            }}
          >
            {data.weight}
          </Typography>
          <Typography
              variant="caption"
              sx={{
                color: '#818181',
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: {
                  xs: '11px',
                  sm: '12px',
                },
                letterSpacing: '0.5px',
              }}
            >
              WEIGHT
            </Typography>
        </Box>

        

        {/* Target */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5,
            }}
          >
           
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: {
                xs: '14px',
                sm: '16px',
              },
            }}
          >
            {data.target}
          </Typography>
          <Typography
              variant="caption"
              sx={{
                color: '#818181',
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: {
                  xs: '11px',
                  sm: '12px',
                },
                letterSpacing: '0.5px',
              }}
            >
              TARGET
            </Typography>
        </Box>
      </Box>
       {/* Objective section */}
       <Box
          sx={{
            display: 'flex',
            bgcolor: '#FFF9E6',
            borderRadius: '12px',
            padding: 2,
            alignItems: 'center',
            mb: 2.5,
            border: '1px solid #FFEFB8',
            mx:'10px'
          }}
        >
          <Box>
            <IconTargetArrow
              size={24}
              style={{ marginRight: 12, color: '#F9BF00' }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#D4A017',
              lineHeight: 1.4,
              fontFamily: 'Inter, sans-serif',
              fontSize: {
                xs: '12px',
              
              },
            }}
          >
            {data.objective}
          </Typography>
        </Box>
    </Box>
  );
};

PlanCard.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string.isRequired,
    initiative: PropTypes.string.isRequired,
    objective: PropTypes.string.isRequired,
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit: PropTypes.string,
    target: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default PlanCard;
