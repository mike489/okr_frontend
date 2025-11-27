import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import { CheckForPendingTasks } from 'utils/check-for-pending-tasks';
import { useDashboards } from 'context/DashboardContext';
import EmployeeDashboard from './employee';
import SuperAdminDashboard from './superadmin';
import AdminDashboard from './admin';
import HrDashboard from './hr';
import StrategyDashboard from './strategy';
import Fallbacks from 'utils/components/Fallbacks';


// ==============================|| HOME DASHBOARD ||============================== //

const Dashboard = () => {
  const { activeDashboard } = useDashboards();

  const dispatch = useDispatch();
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  useEffect(() => {
    // CheckForPendingTasks(dispatch, selectedYear?.id);
  }, [selectedYear, dispatch]);
  

  const fallbackUI = (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          height: '90dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fallbacks
          severity="dashboard"
          title="You don't have right role to view the dashboard"
          description="You don't have right role to view the dashboard"
        />
      </Grid>
     
    </Grid>
  );
  
  if (activeDashboard === 'Super_Admin') {
    return <SuperAdminDashboard />;
  } else if (activeDashboard === 'Strategy') {
    return <StrategyDashboard />;
  } else if (activeDashboard === 'HR') {
    return <HrDashboard />;
  } else if (activeDashboard === 'Admin' || activeDashboard === 'Manager') {
    return <AdminDashboard />;
  } else if (activeDashboard === 'Employee') {
    return <EmployeeDashboard />;
  } else {
    return fallbackUI;
  }
};

export default Dashboard;
