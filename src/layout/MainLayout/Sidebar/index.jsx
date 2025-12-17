// layout/Sidebar/Sidebar.jsx
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  IconButton,
  Avatar,
  Typography,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  IconChevronLeft,
  IconChevronRight,
  IconUser,
} from '@tabler/icons-react';

import LogoSection from '../LogoSection';
import HomeMenu from './HomeMenu';
import MenuList from './MenuList';
import { ActiveUnitSelector } from './active-unit-selector';
import { useSelector } from 'react-redux';
import GetFiscalYear from 'utils/components/GetFiscalYear';
import FiscalYearMenu from '../Header/FiscalYear';

const drawerWidth = 280;
const drawerMiniWidth = 78;

const Sidebar = ({ open, onToggle, isDesktop }) => {
  const theme = useTheme();
  const managerUnits = useSelector((state) => state.managerUnits);
  const user = useSelector((state) => state.user.user);

  const isMini = isDesktop && !open;
  const width = isMini ? drawerMiniWidth : drawerWidth;

  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'white',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '6px 0 20px rgba(0,0,0,0.15)',
        transition: 'width 350ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* HEADER - Fixed height */}
      <Box
        sx={{
          height: 70,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha('#fff', 0.15)}`,
        }}
      >
        <LogoSection mini={isMini} />
      </Box>

      {/* UNIT SELECTOR - Fixed height when visible */}
      {managerUnits?.units?.length > 1 && !isMini && (
        <Box sx={{ px: 3, py: 2, flexShrink: 0 }}>
          <ActiveUnitSelector
            data={managerUnits.units}
            active={managerUnits.activeUnit}
          />
        </Box>
      )}

      {/* MAIN MENU - Scrollable area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // Important for flex scrolling
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 2,
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha('#fff', 0.2),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha('#fff', 0.3),
            },
          }}
        >
          <Stack spacing={1} sx={{ px: isMini ? 1.5 : 2 }}>
            <HomeMenu mini={isMini} />
            <MenuList mini={isMini} />
          </Stack>
        </Box>
      </Box>

      {/* FOOTER - Fixed height at bottom */}
      <Box
        sx={{
          flexShrink: 0,
          width: '100%',
          p: 2,
          borderTop: `1px solid ${alpha('#fff', 0.15)}`,
          bgcolor: 'primary.main',
        }}
      >
        <FiscalYearMenu />
      </Box>
    </Box>
  );
};

export default Sidebar;
