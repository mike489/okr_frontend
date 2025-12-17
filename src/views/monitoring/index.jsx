// Evaluations.js - Add refresh capability
import React, { useEffect, useState } from 'react';
import { Box, Grid, TablePagination } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import UnitTable from './components/UnitTable';
import Search from 'ui-component/search';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';

const Evaluations = () => {
  const [mounted, setMounted] = useState(false);
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const handleSearchFieldChange = (event) => {
    setSearch(event.target.value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({
      ...pagination,
      per_page: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const handleFetchingAssignments = async () => {
    setLoading(true);
    setError(false);

    try {
      const token = await GetToken();
      const Api =
        Backend.pmsUrl(Backend.monitoring) +
        `?page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

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
        const transformedData = result.data.map((item) => ({
          id: item.unit?.id || `unit-${Math.random()}`,
          unit: item.unit,
          key_results: item.key_results || [],
          status: 'Active',
          created_at: item.unit?.created_at,
          updated_at: item.unit?.updated_at,
        }));

        setData(transformedData);

        setPagination((prev) => ({
          ...prev,
          total: result.data.length || 0,
          last_page:
            result.last_page ||
            Math.ceil((result.data.length || 0) / pagination.per_page),
        }));
      } else {
        setError(true);
        toast.error(result.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      setError(true);
      toast.error(error.message || 'Network error occurred');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle data refresh after modal submission
  const handleDataUpdate = () => {
    handleFetchingAssignments();
  };

  useEffect(() => {
    handleFetchingAssignments();
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingAssignments();
    }, 800);

    return () => clearTimeout(debounceTimeout);
  }, [search]);

  // Fetch on pagination changes
  useEffect(() => {
    if (mounted) {
      handleFetchingAssignments();
    } else {
      setMounted(true);
    }
  }, [pagination.page, pagination.per_page]);

  return (
    <PageContainer
      back={false}
      title="Unit Key Results"
      searchField={<Search value={search} onChange={handleSearchFieldChange} />}
    >
      <Grid container>
        <Grid item xs={12} sx={{ padding: 2 }}>
          {loading ? (
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              padding={4}
            >
              <ActivityIndicator size={20} />
            </Grid>
          ) : error ? (
            <Fallbacks
              severity="error"
              title="Failed to load units"
              description="Unable to fetch units with key results. Please try again later."
              sx={{ paddingTop: 6 }}
            />
          ) : !data || data.length === 0 ? (
            <Fallbacks
              severity="info"
              title="No units found"
              description="No units with key results found."
              sx={{ paddingTop: 6 }}
            />
          ) : (
            <UnitTable units={data} onUpdate={handleDataUpdate} />
          )}

          {!loading && !error && pagination.total > 0 && (
            <TablePagination
              component="div"
              rowsPerPageOptions={[10, 25, 50, 100]}
              count={pagination.total}
              rowsPerPage={pagination.per_page}
              page={pagination.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Grid>
      </Grid>
      <ToastContainer />
    </PageContainer>
  );
};

export default Evaluations;
