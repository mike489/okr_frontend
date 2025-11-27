import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { gridSpacing } from 'store/constant';
import { MyDay } from './components/employee-dashboard/MyDay';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import gardenImage from 'assets/images/sky-blue.jpg';
import PageContainer from 'ui-component/MainPage';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import MonthlyTrends from 'views/performance/components/MonthlyTrends';
import DashboardSelector from './dashboard-selector';
import PersonalReport from './personalReport';
import OverallPerformance from './components/OverallPerformance';
import MyPlanGrade from 'ui-component/charts/myPlanGrade';
import ChildUnits from 'ui-component/charts/ChildUnits';
import MyPlanTable from 'ui-component/charts/myPlanTable';

const EmployeeDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Mobile (<600px)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Tablet (600px-960px)
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md')); // Small device (<960px)
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  console.log('Monthly Trends', monthlyTrend);
  const [monthFilter, setMonthFilter] = useState('current_month');
  const [quarterFilter, setQuarterFilter] = useState('current_quarter');

  console.log('Monthly Data', monthlyTrend);

 
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer
      title={'Personal Report'}
      rightOption={<DashboardSelector />}
      sx={{ px: { xs: 1, sm: 2, md: 3 } }}
    >
      {/* <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: { xs: 1, sm: 2, md: 3 },
          '& .MuiTabs-flexContainer': {
            flexDirection: 'row',
            alignItems: 'flex-start',
          },
        }}
        TabIndicatorProps={{ style: { backgroundColor: '#1D4DBD' } }}
        variant={isMobile ? 'fullWidth' : 'standard'}
      >
        <Tab
          label="Overall Report"
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: activeTab === 0 ? '#1D4DBD !important' : 'text.secondary',
            px: { xs: 1, sm: 2 },
          }}
        />
        <Tab
          label="Personal Report"
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: activeTab === 1 ? '#1D4DBD !important' : 'text.secondary',
            px: { xs: 1, sm: 2 },
          }}
        />
      </Tabs> */}

      {activeTab === 0 && (
        <Grid container spacing={isMobile ? 1 : gridSpacing}>
          {/* Overall Performance and Monthly Trends Row */}
          <Grid item xs={24} justifyContent='space-center'>
            <Grid container spacing={isMobile ? 1 : gridSpacing} justifyContent="space-center" gap={4} className='flex flex-row md:flex-row'>
              {/* Overall Performance */}
              <Grid item xs={12} sm={6} md={4} lg={4} justifyContent='space-between'>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      // gap: 1,
                      mt: 0,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter', // Fixed font property
                        fontWeight: 500,
                        fontSize: '30px',
                        color: '#111827',
                      }}
                    >
                      Overall Performance
                    </Typography>
                  </Box>
                 <Box sx={{placeItems:'center', justifyContent:'center'}}>
                  <OverallPerformance month={monthFilter} quarter={quarterFilter} />

                  </Box>
                </Box>
              </Grid>

              {/* Monthly Trends */}
              <Grid item xs={12} sm={6} md={6} lg={6} width={'100%'} >
                
                  <Box
                    sx={{
                
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '30px',
                        color: '#111827',
                      }}
                    >
                      Monthly Trends
                    </Typography>
                   
                  </Box>
                  <Box sx={{ padding: 2, backgroundColor: '#fff', width: '600px'}}>
                  <MonthlyTrends
                    monthFilter={monthFilter}
                    quarterFilter={quarterFilter}
                    loading={loading}
                  />

                  </Box>
               
              </Grid>
            </Grid>
          </Grid>

          {/* My Plan and Child Units */}
          <Grid item xs={12}>
            <Grid container spacing={isMobile ? 1 : gridSpacing}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Box>
                  <MyPlanGrade />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Box>
                  <ChildUnits />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Plan Table */}
          <Grid item xs={12}>
            <MyPlanTable />
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          <PersonalReport />
        </Box>
      )}
    </PageContainer>
  );
};

export default EmployeeDashboard;