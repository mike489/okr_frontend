import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Grid, StyledEngineProvider } from '@mui/material';
import themes from 'themes';
import NavigationScroll from 'layout/NavigationScroll';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthContext } from 'context/AuthContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KPIProvider } from 'context/KPIProvider';
import { ToastContainer } from 'react-toastify';
import { Storage } from 'configration/storage';
import { SIGN_IN } from 'store/actions/actions';
import MainRoutes from 'routes/MainRoutes';
import AuthenticationRoutes from 'routes/AuthenticationRoutes';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TargetProvider } from 'context/TargetContext';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import { DashboardProvider } from 'context/DashboardContext';

// ==============================|| APP ||============================== //

const queryClient = new QueryClient();

// Tenant helper
const getTenantFromUrl = () => {
  const stored = localStorage.getItem('current_tenant');
  if (stored) return stored;

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) return parts[0].split('-')[0];

  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/^\/([a-z0-9]+)\/?/i);
  if (pathMatch) {
    const tenant = pathMatch[1].toLowerCase();
    const blocked = ['login', 'register', 'api', 'auth', 'dashboard'];
    if (!blocked.includes(tenant)) return tenant;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const queryTenant = searchParams.get('tenant');
  if (queryTenant) return queryTenant.toLowerCase();

  return null;
};

const App = () => {
  const customization = useSelector((state) => state.customization);
  const signed = useSelector((state) => state.user.signed);
  const dispatch = useDispatch();
  const prevSigned = useRef(signed);

  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // 1️⃣ Tenant check
  // useEffect(() => {
  //   const tenant = getTenantFromUrl();
  //   if (tenant) {
  //   localStorage.setItem('current_tenant', tenant);
  //     // Redirect to main/original URL if no tenant
  //     // window.location.href = 'https://okr.amanueld.info/';
  //     return;
  //   }
  //   setLoading(false);
  // }, []);

  const authContext = useMemo(
    () => ({
      signin: () => setIsSignedIn(true),
      signOut: () => setIsSignedIn(false),
      isSignedIn,
    }),
    [isSignedIn]
  );

  const routes = useMemo(() => (signed ? MainRoutes : AuthenticationRoutes), [signed]);
  const router = createBrowserRouter([routes]);

  // 2️⃣ Reload on sign-in/sign-out
  useEffect(() => {
    if (prevSigned.current !== signed) {
      setIsReloading(true);
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
    prevSigned.current = signed;
  }, [signed]);

  // 3️⃣ Token expiration check
  useEffect(() => {
    const ttl = Storage.getItem('tokenExpiration');
    if (Date.now() > ttl) {
      dispatch({ type: SIGN_IN, signed: false });
      Storage.clear();
    }
  }, [dispatch]);

  if ( isReloading) {
    return (
      <Grid container sx={{ height: '100dvh' }}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size={50} />
        </Grid>
      </Grid>
    );
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthContext.Provider value={authContext}>
            <DashboardProvider>
              <KPIProvider>
                <TargetProvider>
                  <QueryClientProvider client={queryClient}>
                    <CssBaseline />
                    <NavigationScroll>
                      <RouterProvider router={router} />
                      <ToastContainer />
                    </NavigationScroll>
                  </QueryClientProvider>
                </TargetProvider>
              </KPIProvider>
            </DashboardProvider>
          </AuthContext.Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
