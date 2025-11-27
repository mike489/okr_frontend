import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import Backend from 'services/backend';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const MyPlanGrade = () => {
  const [unit, setUnit] = useState('Unit 1');
  const [duration, setDuration] = useState('Last 7 month');
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
      toast.error('Please select a fiscal year');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.myPlanGrade}?month=${month}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      // Set count to the data array from the response
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

  // Map the count state to the series data for the chart
  const seriesData = count.map((item) => item.value);

  const options = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        columnWidth: '20%',
        borderRadius: 10,
        borderRadiusApplication: 'end',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ['Very Good', 'Good', 'Acceptable', 'Low', 'Very Low'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        opacityFrom: 0.9,
        opacityTo: 0.2,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: '#4CAF50',
            opacity: 1,
          },
          {
            offset: 100,
            color: '#A5D6A7',
            opacity: 0.3,
          },
        ],
      },
    },
    yaxis: { max: 120 },
  };

  const series = [
    { name: 'Value', data: seriesData.length ? seriesData : [0, 0, 0, 0, 0] },
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
            fontWeight="bold"
            sx={{
              font: 'Inter',
              fontWeight: 500,
              fontSize: '30px',
              color: '#111827',
            }}
          >
            My Plan Grade
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <MenuItem value="Unit 1">Unit 1</MenuItem>
                <MenuItem value="Unit 2">Unit 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <MenuItem value="Last 7 month">Last 7 month</MenuItem>
                <MenuItem value="Last Quarter">Last Quarter</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <ActivityIndicator size={20} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Chart options={options} series={series} type="bar" height={300} />
        )}
      </CardContent>
    </Card>
  );
};

export default MyPlanGrade;
