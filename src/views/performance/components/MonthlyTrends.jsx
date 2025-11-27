import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';

// project imports
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TrendLineChart from 'ui-component/charts/TrendLineChart';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';

const MonthlyTrends = ({ quarterFilter, monthFilter}) => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleGettingMonthlyTrends = async () => {
    try {
      if (!selectedYear?.id) throw new Error('No fiscal year selected');
      setLoading(true);
      const token = await GetToken();
      // Include monthFilter and quarterFilter if supported by backend
      const Api = `${Backend.api}${Backend.myMonthlyTrends}?fiscal_year_id=${selectedYear?.id}&month=${monthFilter}&quarter=${quarterFilter}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      const result = await response.json();

      if (result.success) {
        setMonthlyTrend(result.data || []);
      } else {
        // throw new Error(result.message || 'Failed to fetch monthly trends');
      }
    } catch (err) {
      // toast.error(err.message);
      // console.error('Error fetching monthly trends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  
    handleGettingMonthlyTrends();
  }, [selectedYear?.id, monthFilter, quarterFilter]);

  return (
    <>
      {loading ? (
        <Box sx={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size={20} />
        </Box>
      ) : (
        <TrendLineChart     data={monthlyTrend} itshows="Performance" />
      )}
    </>
  );
};

export default MonthlyTrends;
