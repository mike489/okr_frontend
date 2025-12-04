import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import ForgotPassword from 'views/authentication/ForgotPassword';
import ResetPassword from 'views/authentication/ResetPassword';
import NotFound from 'views/not-found';
import Home from 'views/landing/Home';
import TenantRegistrations from 'views/landing/TenantRegistrations';


// login option 3 routing
const AuthLogin = Loadable(lazy(() => import('views/authentication/Login')));
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication3/Login3')));
const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication3/Register3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <TenantRegistrations />
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />
    },
    {
      path: '/reset-password',
      element: <ResetPassword />
    },
    {
      path: '/*',
      element: <NotFound />
    }
  ]
};

export default AuthenticationRoutes;
