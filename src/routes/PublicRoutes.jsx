import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import PublicLayout from 'context/PublicContext';
import NotFound from 'views/not-found';
import Home from 'views/landing/Home';

// Lazy load other public pages if needed
const PublicRoutes = {
  path: '/',
  element: <PublicLayout />,
  children: [
    { path: '/', element: <Home /> },
    { path: '*', element: <NotFound /> }
  ]
};

export default PublicRoutes;
