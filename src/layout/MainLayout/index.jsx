
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';

import { SET_MENU } from 'store/actions/actions';
import Header from './Header';
import Sidebar from './Sidebar';
import GetFiscalYear from 'utils/components/GetFiscalYear';
import BottomTab from 'views/settings/tabs/BottomTab';
import IsEmployee from 'utils/is-employee';

const drawerWidth = 280;
const drawerMiniWidth = 78;

const MainLayout = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const isEmployee = IsEmployee();

  const opened = useSelector((state) => state.customization.opened);
  const isDesktop = !matchDownMd;

  const toggle = () => dispatch({ type: SET_MENU, opened: !opened });
  const sidebarWidth = isDesktop
    ? opened ? drawerWidth : drawerMiniWidth
    : opened ? drawerWidth : 0;

  const showSidebar = isDesktop || opened;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR — Always render when needed */}
      {showSidebar && (
        <Sidebar
          open={opened}
          onToggle={toggle}
          isDesktop={isDesktop}
        />
      )}

      {/* MAIN CONTENT — Push content when sidebar is visible */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          // ml: { md: `${sidebarWidth}px` },
          transition: 'margin 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: 'background.default'
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1200,
            height: 70,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(12px)',
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
          
            alignItems: 'center',
            // justifyContent: 'space-between',
            px: { xs: 2, md: 3 },
            boxShadow: 3
          }}
        >
          <Header onDrawerToggle={toggle} drawerOpen={opened} />
        
        </Box>

        {/* CONTENT */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>

      {matchDownMd && isEmployee && <BottomTab />}
    </Box>
  );
};

export default MainLayout;