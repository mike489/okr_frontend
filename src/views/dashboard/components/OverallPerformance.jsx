import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, Typography, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { gridSpacing } from 'store/constant';
import Backend from 'services/backend';
import PerformanceCard from 'ui-component/cards/PerformanceCard';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import GetToken from 'utils/auth-token';
import Fallbacks from 'utils/components/Fallbacks';
import PerKPIPerformance from './PerKPIPerformance';

const OverallPerformance = ({ month, quarter }) => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [performance, setPerformance] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState([]);
  const [overallPerformance, setOverallPerformance] = useState(0);
  const [overallColor, setOverallColor] = useState('#F44336');

  const handlePeriodSelection = (index) => {
    setSelectedPeriod([performance[index]]);
  };

  const hasPerKpiObjects = selectedPeriod.some((quarterData) =>
    Object.values(quarterData).some(
      (quarter) => Array.isArray(quarter.per_kpi) && quarter.per_kpi.length > 0,
    ),
  );

  useEffect(() => {
    const handleFetchingPerformance = async () => {
      if (selectedYear?.id) {
        setIsLoading(true);
        try {
          const token = await GetToken();
          const Api =
            Backend.api +
            Backend.myMonthlyTrends +
            `?fiscal_year_id=${selectedYear?.id}`;

          const header = {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
            'Content-Type': 'application/json',
          };

          const response = await fetch(Api, {
            method: 'GET',
            headers: header,
          });
          const result = await response.json();

          if (result.success) {
            // Transform quarterly data
            const transformedPerformance = result.data.Quarterly.map((item) => ({
              [item.quarter]: {
                name: item.quarter,
                overall: item.value,
                is_evaluated: item.value > 0,
                color:
                  item.value >= 85
                    ? '#2196F3'
                    : item.value >= 70
                    ? '#4CAF50'
                    : item.value > 0
                    ? '#FFC107'
                    : '#F44336',
                per_kpi: [],
              },
            }));
            
            setPerformance(transformedPerformance);
            
            // Set overall performance from API
            const overallValue = result.data?.Overall || 0;
            setOverallPerformance(Math.round(overallValue));
            
            // Set overall color
            const overallColorValue =
              overallValue >= 85
                ? '#2196F3'
                : overallValue >= 70
                ? '#4CAF50'
                : overallValue > 0
                ? '#FFC107'
                : '#F44336';
            setOverallColor(overallColorValue);
          } else {
            // toast.warning(result.message || 'Failed to fetch performance data');
          }
        } catch (error) {
          // toast.warning(error.message || 'An error occurred');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleFetchingPerformance();
  }, [selectedYear]);

  return (
    <Grid container spacing={gridSpacing} height={'100%'} width="100%">
      <Grid item >
        <Card
          sx={{
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            // alignItems: 'center',
            // justifyContent: 'center',
            // gap: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              // justifyContent: 'center',
              // gap: 2,
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  // p: 2,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <PerformanceCard
                  isEvaluated={overallPerformance > 0}
                  performance={overallPerformance}
                  frequency=""
                  size={100}
                  color={overallColor}
                  // onPress={() => handlePeriodSelection()}
                />
              </Box>
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                // p: 2,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  // py: 3,
                  bgcolor: 'white',
                }}
              >
                <Box
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    bgcolor: '#0CAF60',
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    fontSize: '22px',
                    color: '#212B36',
                    fontFamily: 'Inter',
                  }}
                >
                  Quarterly Report
                </Typography>
              </Box>
              {isLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                  }}
                >
                  <ActivityIndicator size={20} />
                </Box>
              ) : performance.length > 0 ? (
                <Grid container spacing={2} justifyContent="space-between">
                  {performance.map((period, index) => {
                    const periodName = Object.keys(period)[0];
                    return (
                      <Grid item xs={6} lg={3} key={index} gap={4}>
                        <PerformanceCard
                          isEvaluated={period[periodName].is_evaluated}
                          performance={period[periodName].overall}
                          frequency={period[periodName].name}
                          size={38}
                          color={period[periodName].color}
                          // onPress={() => handlePeriodSelection(index)}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Fallbacks
                  severity="performance"
                  title="No performance report"
                  description="The performance will be listed here"
                  sx={{ p: 3 }}
                />
              )}
            </Box>
          </Box>
        </Card>
        {selectedPeriod.length > 0 && hasPerKpiObjects && (
          <PerKPIPerformance
            isLoading={isLoading}
            performance={selectedPeriod}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default OverallPerformance;