import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardHeader, useTheme } from '@mui/material';
import { width } from '@mui/system';
// import Card from 'ui-component/cards/DrogaCard';

const TrendLineChart = ({ data, title, subheader, itshows }) => {
  const theme = useTheme();
console.log('Monthly Graph data', data)
  // Process the data for ApexCharts
  const categories = data?.Monthly?.map((item) => item.month.slice(0, 3));
  const values = data?.Monthly?.map((item) => item.value);

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      dropShadow: { enabled: false },
      
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: theme.palette.primary.main
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.6,
        stops: [0, 90, 100]
      }
    },
    colors: [theme.palette.primary[800], theme.palette.primary.main],

    xaxis: {
      categories: categories,
      labels: { style: { colors: theme.palette.text.primary,
        fontSize:'14px',
        fontFamily:'Inter',
        fontWeight:500,
        
       } }
    },

    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary,
        fontSize:'14px',
        fontFamily:'Inter',
        fontWeight:500,
       } }
    },
    tooltip: {
      theme: 'light'
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4
    }
  };

  const series = [
    {
      name: itshows,
      data: values
    }
  ];

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <Chart options={chartOptions} series={series} type="area" height='auto'/>
    </Card>
  );
};

export default TrendLineChart;
