import React, { useEffect, useState, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { Paper, Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';

// -------------------------------------------------
// Color helper
const getColor = (value) => {
  if (value >= 90) return '#00b050';     // Green
  if (value >= 75) return '#92d050';     // Light Green
  if (value >= 67) return '#ffff00';     // Yellow
  if (value > 0) return '#ff0000';       // Red
  return '#c00000';                      // Dark Red
};

// -------------------------------------------------
const ROWS_PER_PAGE = 50; // fetch enough for averages (adjust if needed)

const PerformanceDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  // -------------------------------------------------
  // FETCH ALL data (we need full set for averages)
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

        const url = `${Backend.api}${Backend.getPlanReports}?${params.toString()}`;
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

        const { data: pageData, total, current_page, last_page } = json.data;
        const activities = Array.isArray(pageData) ? pageData : [];

        allItems.push(...activities);

        // Stop if we have all pages
        hasMore = current_page < last_page && activities.length > 0;
        page += 1;
      }

      setData(allItems);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // -------------------------------------------------
  // Compute averages: Unit (Desk) → Type (Program) → Avg %
  const programAverages = React.useMemo(() => {
    const grouped = {};

    data.forEach((item) => {
      const unit = item.unit || 'Unknown Unit';
      const program = item.type || 'Unknown Program';
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
  }, [data]);

  // -------------------------------------------------
  // Exclude "Crosscutting" from bar charts
  const desks = [...new Set(programAverages.map((p) => p.Desk).filter((d) => d !== 'Crosscutting'))];

  const deskData = desks.map((desk) => ({
    Desk: desk,
    Programs: programAverages.filter((p) => p.Desk === desk),
  }));

  // -------------------------------------------------
  // Bar charts per Desk
  const barCharts = deskData.map((desk) => {
    const seriesData = desk.Programs.map((p) => Math.round(p.AveragePercent));
    const barColors = desk.Programs.map((p) => getColor(p.AveragePercent));

    return {
      series: [{ name: 'Performance (%)', data: seriesData }],
      options: {
        chart: { type: 'bar', height: 300 },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            distributed: true,
          },
        },
        colors: barColors,
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val}%`,
          style: { colors: ['#000'] },
        },
        xaxis: {
          categories: desk.Programs.map((p) => p.Program),
          title: { text: 'Program' },
          labels: {
            rotate: -45,
            rotateAlways: true,
            style: { fontSize: '12px' },
          },
        },
        yaxis: { title: { text: 'Performance (%)' }, max: 100 },
        tooltip: {
          custom: ({ dataPointIndex }) => {
            const p = desk.Programs[dataPointIndex];
            return `
              <div style="padding:10px;">
                <strong>Desk:</strong> ${p.Desk}<br/>
                <strong>Program:</strong> ${p.Program}<br/>
                <strong>Avg:</strong> ${Math.round(p.AveragePercent)}%
              </div>
            `;
          },
        },
      },
    };
  });

  // -------------------------------------------------
  // Donut chart (includes all programs, even Crosscutting)
  const donutChartData = {
    series: programAverages.map((p) => Math.round(p.AveragePercent)),
    options: {
      chart: { type: 'donut', height: 400 },
      labels: programAverages.map((p) => p.Program),
      colors: programAverages.map((p) => getColor(p.AveragePercent)),
      dataLabels: {
        enabled: true,
        formatter: (_, opts) => {
          return `${Math.round(programAverages[opts.seriesIndex].AveragePercent)}%`;
        },
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
                formatter: (val, opts) => `${Math.round(programAverages[opts.seriesIndex].AveragePercent)}%`,
              },
              total: {
                show: true,
                label: 'Overall Avg',
                formatter: () => {
                  const avg = programAverages.reduce((s, p) => s + p.AveragePercent, 0) / programAverages.length;
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
  // Render
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading performance data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Alert severity="error">Failed to load performance data. Please try again.</Alert>
      </Box>
    );
  }

  if (programAverages.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          {selectedYear?.name || 'Program'} Performance
        </Typography>
        <Typography sx={{ textAlign: 'center' }}>No data available to display.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', margin: 'auto', px: 10, py: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        {selectedYear?.name || 'Program'} Performance Dashboard
      </Typography>

      {/* Donut Chart */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Overall Program Performance
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

      {/* Bar Charts per Desk */}
      <Grid container spacing={3}>
        {barCharts.map((chart, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Paper sx={{ p: 2, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Desk: {deskData[idx].Desk}
              </Typography>
              <Chart options={chart.options} series={chart.series} type="bar" height={300} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PerformanceDashboard;