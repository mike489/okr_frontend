import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import logo from 'assets/images/logo-icon.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 3, // margin-bottom
      }}
    >
      <Box className="flex flex-row justify-center items-center gap-2">
        <Box>
          <Typography
            variant="body2"
            color="#fff"
            sx={{ fontSize: '0.875rem' }}
          >
            © {currentYear} Droga Consulting. All rights reserved.
          </Typography>
        </Box>
        <Box>
          <Link
            href="https://www.drogaconsulting.com"
            target="_blank"
            rel="noopener"
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              flexDirection: 'row',
                justifyContent: 'center',
            }}
          >
          <Typography
            variant="body2"
            color="#fff"
            sx={{ fontSize: '0.875rem', fontWeight: 500 }}  
            >Power By</Typography>
            <img
              src={logo}
              alt="Droga Consulting"
              style={{ height: 30, width:30, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
            />
            <Typography variant="body2" color="#fff" sx={{ fontWeight: 500 }}>
              Droga Consulting
            </Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
