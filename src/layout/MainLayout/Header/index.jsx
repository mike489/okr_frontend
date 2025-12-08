// layout/Header/Header.jsx
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, IconButton, useMediaQuery } from '@mui/material';
import { IconMenu2 } from '@tabler/icons-react';

import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import LogoSection from '../LogoSection';

import IsEmployee from 'utils/is-employee';

const Header = ({ onDrawerToggle, drawerOpen }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isEmployee = IsEmployee();

  // Show hamburger on:
  // - Mobile (regardless of role)
  // - Desktop only if employee (non-employee (admin, etc.)
  const showToggleButton = !isDesktop || !isEmployee;

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* LEFT: Toggle + Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* HAMBURGER MENU — THIS IS THE FIX */}
        {showToggleButton && (
          <IconButton
            onClick={onDrawerToggle}
            size="large"
            edge="start"
            color="inherit"
            sx={{
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <IconMenu2 stroke={1.5} size="1.8rem" />
          </IconButton>
        )}

        {/* Logo: show when sidebar is mini (desktop) OR on mobile */}
        {/* {(!isDesktop || !drawerOpen) && <LogoSection />} */}
      </Box>

      {/* CENTER */}
      {/* <FiscalYearMenu /> */}

      {/* RIGHT */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationSection />
        <ProfileSection />
      </Box>
    </Box>
  );
};

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired
};

export default Header;