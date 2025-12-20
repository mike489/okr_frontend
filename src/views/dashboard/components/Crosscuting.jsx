import React, { useEffect, useState, useCallback } from 'react';
import Chart from 'react-apexcharts';
import {
  Paper,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSelector } from 'react-redux';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';

// -------------------------------------------------
// Color helper
const getColor = (value) => {
  if (value >= 90) return '#00b050'; // Green
  if (value >= 75) return '#92d050'; // Light Green
  if (value >= 67) return '#ffff00'; // Yellow
  if (value > 0) return '#ff0000'; // Red
  return '#c00000'; // Dark Red
};

// -------------------------------------------------
const ROWS_PER_PAGE = 50;

const Crosscutting = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  // -------------------------------------------------
  // FETCH ALL data
  const fetchAllData = useCallback(async () => {
    if (!selectedYear?.id) return;

    try {
      setLoading(true);
      setError(false);
      const token = await GetToken();

      const allItems = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          fiscal_year_id: selectedYear.id,
          page: String(page),
          per_page: String(ROWS_PER_PAGE),
        });

        const url = `${Backend.pmsUrl}${Backend.getPlanReports}?${params.toString()}`;
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const json = await resp.json();

        if (!json.success || !json.data) break;

        const { data: pageData, current_page, last_page } = json.data;
        const activities = Array.isArray(pageData) ? pageData : [];

        allItems.push(...activities);

        hasMore = current_page < last_page && activities.length > 0;
        page++;
      }

      setData(allItems);
    } catch (e) {
      console.error('Crosscutting fetch error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // -------------------------------------------------
  // FILTER: Only Crosscutting programs
  const crosscuttingData = data.filter(
    (item) =>
      item.unit?.toLowerCase().includes('crosscutting') ||
      item.type?.toLowerCase().includes('crosscutting'),
  );

  // -------------------------------------------------
  // Compute averages: Unit → Type (Program)
  const programAverages = React.useMemo(() => {
    const grouped = {};

    crosscuttingData.forEach((item) => {
      const unit = item.unit || 'Crosscutting';
      const program = item.type || 'Crosscutting Activity';
      const percent = item.percentage_completed?.percentage ?? 0;

      const key = `${unit}|${program}`;
      if (!grouped[key]) {
        grouped[key] = { unit, program, values: [] };
      }
      grouped[key].values.push(percent);
    });

    return Object.values(grouped).map((g) => ({
      Desk: g.unit,
      Program: g.program,
      AveragePercent: g.values.reduce((a, b) => a + b, 0) / g.values.length,
    }));
  }, [crosscuttingData]);

  // -------------------------------------------------
  // Donut Chart (only Crosscutting)
  const donutChartData = {
    series: programAverages.map((p) => Math.round(p.AveragePercent)),
    options: {
      chart: { type: 'donut', height: 400 },
      labels: programAverages.map((p) => p.Program),
      colors: programAverages.map((p) => getColor(p.AveragePercent)),
      dataLabels: {
        enabled: true,
        formatter: (_, opts) =>
          `${Math.round(programAverages[opts.seriesIndex].AveragePercent)}%`,
        style: { fontSize: '14px', fontWeight: 'bold' },
      },
      legend: {
        position: 'bottom',
        formatter: (_, opts) => {
          const p = programAverages[opts.seriesIndex];
          return `<span style="color:${getColor(p.AveragePercent)}">
                    ${p.Program} - ${Math.round(p.AveragePercent)}%
                  </span>`;
        },
      },
      tooltip: {
        custom: ({ seriesIndex }) => {
          const p = programAverages[seriesIndex];
          return `
            <div style="padding:10px;">
              <strong>Desk:</strong> ${p.Desk}<br/>
              <strong>Program:</strong> ${p.Program}<br/>
              <strong>Avg:</strong> ${Math.round(p.AveragePercent)}%
            </div>
          `;
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              value: {
                formatter: (_, opts) =>
                  `${Math.round(programAverages[opts.seriesIndex].AveragePercent)}%`,
              },
              total: {
                show: true,
                label: 'Crosscutting Avg',
                formatter: () => {
                  const avg =
                    programAverages.reduce((s, p) => s + p.AveragePercent, 0) /
                    programAverages.length;
                  return `${Math.round(avg)}%`;
                },
              },
            },
          },
        },
      },
    },
  };

  // -------------------------------------------------
  // Render States
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Crosscutting data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Alert severity="error">
          Failed to load Crosscutting performance. Please try again.
        </Alert>
      </Box>
    );
  }

  if (programAverages.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Crosscutting Performance
        </Typography>
        <Typography sx={{ textAlign: 'center' }}>
          No Crosscutting activities found for{' '}
          {selectedYear?.name || 'this year'}.
        </Typography>
      </Box>
    );
  }

  // -------------------------------------------------
  return (
    <Box sx={{ width: '100%', margin: 'auto', px: 10, py: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Crosscutting Performance
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Overall Crosscutting Performance (Donut Chart)
            </Typography>
            <Chart
              options={donutChartData.options}
              series={donutChartData.series}
              type="donut"
              height={400}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Optional: Show summary stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', boxShadow: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Programs
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {programAverages.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', boxShadow: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Avg Performance
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={getColor(
                programAverages.reduce((s, p) => s + p.AveragePercent, 0) /
                  programAverages.length,
              )}
            >
              {Math.round(
                programAverages.reduce((s, p) => s + p.AveragePercent, 0) /
                  programAverages.length,
              )}
              %
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', boxShadow: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Fiscal Year
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {selectedYear?.name || '—'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Crosscutting;
