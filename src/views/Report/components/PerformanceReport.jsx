import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { gridSpacing } from 'store/constant';
import { reportFrequencies } from 'data/report';
import { useNavigate } from 'react-router-dom';
import { ExportMenu } from 'ui-component/menu/ExportMenu';
import Backend from 'services/backend';
import DrogaCard from 'ui-component/cards/DrogaCard';
import PerformanceCard from 'ui-component/cards/PerformanceCard';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import GetToken from 'utils/auth-token';
import Fallbacks from 'utils/components/Fallbacks';
import DrogaDonutChart from 'ui-component/charts/DrogaDonutChart';
import SelectorMenu from 'ui-component/menu/SelectorMenu';
import { handleExcelExport } from './PerformanceExport';

const PerformanceReport = ({ hidePerformanceDetail }) => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const theme = useTheme();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState([]); 
  const [overallPerformance, setOverallPerformance] = useState({
    overall: 0,
    scale: '',
    color: theme.palette.primary.main,
  });

  const [filter, setFilter] = useState({
    frequencies: 'quarterly',
  });

  const handleFiltering = (event) => {
    const { value, name } = event.target;
    setFilter({ ...filter, [name]: value });
  };

  // Function to derive scale and color based on value
  const deriveScaleAndColor = (value) => {
    let scale = 'Not Evaluated';
    let color = '#F44336'; // Red for not evaluated

    if (value > 0) {
      if (value >= 85) {
        scale = 'Excellent';
        color = '#2196F3'; // Blue
      } else if (value >= 70) {
        scale = 'Good';
        color = '#4CAF50'; // Green
      } else {
        scale = 'Average';
        color = '#FFC107'; // Yellow
      }
    }

    return { scale, color };
  };

  useEffect(() => {
    const handleFetchingPerformance = async () => {
      if (selectedYear?.id) {
        setIsLoading(true);
        try {
          const token = await GetToken();
          const Api =
            Backend.api +
            Backend.myMonthlyTrends +
            `?fiscal_year_id=${selectedYear?.id}&filter_by=${filter.frequencies}`;

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
            // Extract OverallPerformance value
            const overallValue = result.data.Overall || 0;
            const { scale, color } = deriveScaleAndColor(overallValue);

            // Set overall performance
            setOverallPerformance({
              overall: overallValue,
              scale,
              color,
            });

            // Select the appropriate data based on filter.frequencies
            const dataKey = filter.frequencies === 'monthly' ? 'Monthly' : 'Quarterly';
            const performanceArray = result.data[dataKey] || [];

            // Transform the data into the expected structure
            const transformedPerformance = performanceArray.map((item) => {
              const periodName = filter.frequencies === 'monthly' ? item.month : item.quarter;
              const value = item.value || 0;
              const { scale: itemScale, color: itemColor } = deriveScaleAndColor(value);

              return {
                [periodName]: {
                  name: periodName,
                  value,
                  is_evaluated: value > 0,
                  scale: itemScale,
                  color: itemColor,
                },
              };
            });

            setPerformanceData(transformedPerformance);
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
  }, [selectedYear, filter.frequencies, theme.palette]);

  return (
    <Grid item xs={12}>
      <Grid container spacing={gridSpacing}>
        <Grid
          item
          xs={12}
          sm={12}
          md={!hidePerformanceDetail && 6}
          lg={!hidePerformanceDetail && 4}
          xl={!hidePerformanceDetail && 4}
        >
          <DrogaCard sx={{ mt: 2 }}>
            <Typography variant="h4">Overall Performance</Typography>
            <Grid
              container
              sx={{
                marginTop: 2,
                borderTop: 0.8,
                borderColor: theme.palette.divider,
                padding: 2,
                pb: 1.6,
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                  }}
                >
                  <ActivityIndicator size={20} />
                </Box>
              ) : (
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DrogaDonutChart
                    value={parseFloat(overallPerformance.overall).toFixed(1)}
                    size={68}
                    color={overallPerformance.color}
                  />
                  <Typography variant="h4" mt={2}>
                    Annual Performance
                  </Typography>
                  {overallPerformance.overall > 0 && (
                    <Typography variant="subtitle2">{overallPerformance.scale}</Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </DrogaCard>
        </Grid>

        {!hidePerformanceDetail && (
          <Grid item xs={12} sm={12} md={6} lg={8} xl={8}>
            <DrogaCard sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h4">Performances</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SelectorMenu
                    name="frequencies"
                    options={reportFrequencies}
                    selected={filter.frequencies}
                    handleSelection={handleFiltering}
                  />
                  <ExportMenu onExcelDownload={() => handleExcelExport(performanceData)} />
                </Box>
              </Box>

              <Grid container>
                <Grid item xs={12}>
                  {isLoading ? (
                    <Grid
                      container
                      sx={{
                        borderTop: 0.8,
                        borderColor: theme.palette.divider,
                        padding: 8,
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ActivityIndicator size={20} />
                      </Grid>
                    </Grid>
                  ) : performanceData.length > 0 ? (
                    <Grid
                      container
                      sx={{
                        borderTop: 0.8,
                        borderColor: theme.palette.divider,
                        padding: 1,
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: filter.frequencies !== 'semi_annual' ? 'space-around' : 'center',
                          mx: 2,
                          gap: 2,
                        }}
                      >
                        {performanceData.map((period, index) => {
                          const periodName = Object.keys(period)[0];
                          const periodData = period[periodName];

                          return (
                            <PerformanceCard
                              key={index}
                              isEvaluated={periodData.is_evaluated}
                              performance={periodData.value} 
                              scale={periodData.scale}
                              color={periodData.color}
                              frequency={periodData.name}
                              
                            />
                          );
                        })}
                      </Grid>
                    </Grid>
                  ) : (
                    <Fallbacks
                      severity="performance"
                      title={`No performance report`}
                      description={`The performance will be listed here`}
                      sx={{ paddingTop: 2 }}
                    />
                  )}
                </Grid>
              </Grid>
            </DrogaCard>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default PerformanceReport;