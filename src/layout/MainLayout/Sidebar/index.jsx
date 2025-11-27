import PropTypes from 'prop-types';

// material-ui
import { Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import { drawerWidth } from 'store/constant';
import MenuList from './MenuList';
import LogoSection from '../LogoSection';
import HomeMenu from './HomeMenu';
import { ActiveUnitSelector } from './active-unit-selector';
import { useSelector } from 'react-redux';

// ==============================|| SIDEBAR DRAWER ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

  const managerUnits = useSelector((state) => state.managerUnits);

  const drawer = (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          width: drawerWidth,
          zIndex: 1,
          paddingY: 1.6,
          paddingX: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <LogoSection />
      </Box>
      <BrowserView
        style={{
          marginTop: 6,
          paddingLeft: 6,
          paddingRight: 12,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {managerUnits?.units.length > 1 ? (
          <ActiveUnitSelector
            data={managerUnits?.units}
            active={managerUnits.activeUnit}
            sx={{ my: 2 }}
          />
        ) : null}
        <HomeMenu />
        <MenuList />
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <HomeMenu />
          <MenuList />
        </Box>
      </MobileView>
    </>
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 50 }, width: matchUpMd ? drawerWidth : 'auto' }}
      aria-label="drawers"
    >
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: theme.palette.background.paper,
          },
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object,
};

export default Sidebar;
