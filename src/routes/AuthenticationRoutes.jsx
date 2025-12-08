import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import ForgotPassword from 'views/authentication/ForgotPassword';
import ResetPassword from 'views/authentication/ResetPassword';
import NotFound from 'views/not-found';
import Home from 'views/landing/Home';
import TenantRegistrations from 'views/landing/TenantRegistrations';

// lazy components
const AuthLogin = Loadable(lazy(() => import('views/authentication/Login')));

// ==============================|| TENANT CHECK ||============================== //

let tenant = localStorage.getItem("current_tenant") || "acme";
console.log("Tenant:", tenant)

if (!tenant) {
  const parts = window.location.hostname.split(".");
  if (parts.length >= 3) tenant = parts[0] || "acme"; 
}

// ==============================|| ROUTES ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [

    ...(tenant
      ? [
          {
            path: '',          
            element: <AuthLogin />
          },
          {
            path: 'login',
            element: <AuthLogin />
          }
        ]
      : [
         {
            path: '',          
            element: <Home />
          }
          
        ]
    ),

    // -------------------------------------------------------
    // STATIC ROUTES
    // -------------------------------------------------------
    {
      path: 'register',
      element: <TenantRegistrations />
    },
    {
      path: 'forgot-password',
      element: <ForgotPassword />
    },
    {
      path: 'reset-password',
      element: <ResetPassword />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]
};

export default AuthenticationRoutes;
