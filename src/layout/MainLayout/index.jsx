import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Customization from 'layout/Customization';

// project imports
import { styled, useTheme } from '@mui/material';
import { SET_MENU } from 'store/actions/actions';
import { drawerWidth } from 'store/constant';
import Header from './Header';
import Sidebar from './Sidebar';
import GetFiscalYear from 'utils/components/GetFiscalYear';
import BottomTab from 'views/settings/tabs/BottomTab';
import IsEmployee from 'utils/is-employee';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  ...theme.typography.mainContent,
  ...(!open && {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth})`
    },
    [theme.breakpoints.down('md')]: {
      width: `100%`
    },
    [theme.breakpoints.down('sm')]: {
      width: `100%`
    }
  }),
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: `calc(100% - ${drawerWidth}px)`
  })
}));

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const theme = useTheme();
  const employee = IsEmployee();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  const user = useSelector((state) => state.user.user);
  const isSuperAdmin = user?.roles?.length === 1 && user.roles[0].name.toLowerCase() === 'super_admin';

  return (
    <Box sx={{ display: 'flex' }}>
      {(!matchDownMd || !employee) && <Sidebar drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />}
      <Main theme={theme} open={leftDrawerOpened} sx={{ backgroundColor: theme.palette.background.default }}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 2,
            paddingX: 2,
            paddingY: 1.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: {
              xl: leftDrawerOpened ? `calc(100% - ${drawerWidth}px)` : '100%',
              lg: leftDrawerOpened ? `calc(100% - ${drawerWidth}px)` : '100%',
              md: leftDrawerOpened ? `calc(100% - ${drawerWidth}px)` : '100%',
              sm: '100%',
              xs: '100%'
            },
            backgroundColor: theme.palette.primary.light,
            borderBottom: 0.6,
            borderColor: theme.palette.divider
          }}
        >
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} drawerOpen={leftDrawerOpened} />
          {!isSuperAdmin && <GetFiscalYear />}
        </Box>

        <Outlet />
      </Main>
      {matchDownMd && employee && <BottomTab />}
      {/* <Customization /> */}
    </Box>
  );
};

export default MainLayout;
