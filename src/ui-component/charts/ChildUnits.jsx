import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Chart from 'react-apexcharts';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const ChildUnits = () => {
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  const [frequency, setFrequency] = useState('Monthly');
  const [month, setMonth] = useState('May');
  const [count, setCount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('Child Unit Count', count);

  const handleGettingChildUnitCount = async () => {
    if (!selectedYear?.id) {
      setError('Please select a fiscal year');
      return;
    }

    try {
      setLoading(true);
      // setError(null);
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.childUnitsCount}?fiscal_year_id=${selectedYear.id}&frequency=${frequency}&month=${month}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      setCount(result.data || []);
    } catch (err) {
      // setError(err.message);
      // toast.error(err.message);
      // console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGettingChildUnitCount();
  }, [selectedYear, frequency, month]);

  const maxValue =
    count.length > 0 ? Math.max(...count.map((item) => item.value || 0)) : 0;
  const yAxisMax = maxValue > 0 ? maxValue + 20 : 120;

  const fixedBarHeight = yAxisMax;

  const filledData = count.map((item) => item.value || 0);
  const unfilledData = count.map((item) => {
    const value = item.value || 0;
    return fixedBarHeight - value;
  });

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: true },
      stacked: true,
    },
    plotOptions: {
      bar: {
        columnWidth: '24px',
        borderRadius: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: count.map((item) => item.unit_name),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter',
          colors: '#111827',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      max: yAxisMax,
    },
    colors: ['#3D5AFE', '#E5E7EB'],
    fill: {
      opacity: [1, 0.5],
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 0) return val;
          return '';
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    { name: 'Unit', data: filledData },
    { name: '', data: unfilledData },
  ];

  return (
    <Card elevation={0}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={500}
            fontSize="30px"
            color="#111827"
            fontFamily="Inter"
          >
            Child Units
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {['May', 'June', 'July'].map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <ActivityIndicator size={20} />
          </Box>
        ) : count.length > 0 ? (
          <Chart options={options} series={series} type="bar" height={300} />
        ) : (
          <Alert severity="info" sx={{ mt: 2, justifyContent: 'center' }}>
            No data available
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildUnits;
