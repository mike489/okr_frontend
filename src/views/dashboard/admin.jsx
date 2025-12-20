import React, { useEffect, useState } from 'react';
// material-ui
import Grid from '@mui/material/Grid';

// project imports
import { gridSpacing } from 'store/constant';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import {
  IconArrowsDiagonal,
  IconBuilding,
  IconCheck,
  IconRulerMeasure,
  IconUsers,
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PageContainer from 'ui-component/MainPage';
import DrogaCard from 'ui-component/cards/DrogaCard';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import { MyPlanList } from './components/admin/YourKPIList';
import { ApprovalTaskPanel } from './components/admin/ApprovalTaskPanel';
import ChildUnits from './components/admin/ChildUnits';
import PerformanceReport from 'views/Report/components/PerformanceReport';
import MonthlyTrends from 'views/performance/components/MonthlyTrends';
import DashboardSelector from './dashboard-selector';
import OverallPerformance from './components/OverallPerformance';
import MyPlanGrade from 'ui-component/charts/myPlanGrade';
import MyPlanTable from 'ui-component/charts/myPlanTable';
import { useDispatch } from 'react-redux';
import DepartmentsTable from './components/DepartmentsTable';
import PerformanceDashboard from './components/PerformanceDashboard';
import Crosscutting from './components/Crosscuting';
const AdminDashboard = () => {
  const theme = useTheme();
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  const [loading, setLoading] = useState(false);

  const [monthFilter, setMonthFilter] = useState('current_month');
  const [quarterFilter, setQuarterFilter] = useState('current_quarter');
  const [statLoading, setStatLoading] = useState(true);
  const [stats, setStats] = useState([]);

  const handleFetchingStats = async () => {
    setStatLoading(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.taskCounts;

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setStats(response.data);
        } else {
          // toast.warning(response.message);
        }
      })
      .catch((error) => {
        // toast.warning(error.message);
      })
      .finally(() => {
        setStatLoading(false);
      });
  };

  // useEffect(() => {
  //   handleFetchingStats();
  // }, [selectedYear]);

  return (
    <PageContainer title="Dashboard" rightOption={<DashboardSelector />}>
      <Grid container spacing={gridSpacing} justifyContent="center">
        {/* Overall Performance and Monthly Trends Row */}
        <Grid item xs={24} justifyContent="space-center">
          <Grid
            container
            spacing={gridSpacing}
            justifyContent="space-center"
            gap={4}
            className="flex flex-row md:flex-row"
          >
            {/* Overall Performance */}
            <Box>{/* <DepartmentsTable /> */}</Box>
          </Grid>
        </Grid>
        <Box
          sx={{
            width: '100%',
            margin: 'auto',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>{/* <PerformanceDashboard /> */}</Box>
          <Box>{/* <Crosscutting /> */}</Box>
        </Box>
      </Grid>
    </PageContainer>
  );
};

export default AdminDashboard;
