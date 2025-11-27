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
import GetFiscalYear from 'utils/components/GetFiscalYear';

const Evaluations = () => {
  const [mounted, setMounted] = useState(false);
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  const handleSearchFieldChange = (event) => {
    setSearch(event.target.value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };

  const handleFetchingUnits = async () => {
    if (selectedYear) {
      setLoading(true);
      const token = await GetToken();
      const Api = 
        Backend.api +
        Backend.getMyChildUnits +
        `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;
      
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      fetch(Api, {
        method: 'GET',
        headers: header,
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.success) {
            const unitsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setData(unitsData);
            setPagination({ ...pagination, total: response.data?.total || unitsData.length });
            setError(false);
          } else {
            toast.warning(response.data?.message || "Failed to fetch units");
          }
        })
        .catch((error) => {
          toast.error(error.message);
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      <GetFiscalYear />;
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingUnits();
    }, 800);

    return () => clearTimeout(debounceTimeout);
  }, [search]);

  useEffect(() => {
    if (mounted) {
      handleFetchingUnits();
    } else {
      setMounted(true);
    }
  }, [selectedYear, pagination.page, pagination.per_page]);

  return (
    <PageContainer
      back={false}
      title="Monitoring"
      searchField={
        <Search
          value={search}
          onChange={handleSearchFieldChange}
        />
      }
    >
      <Grid container>
        <Grid item xs={12} sx={{ padding: 2 }}>
          {loading ? (
            <Grid container justifyContent="center" alignItems="center" padding={4}>
              <ActivityIndicator size={20} />
            </Grid>
          ) : error ? (
            <Fallbacks
              severity="error"
              title="Failed to load units"
              description="Unable to fetch units. Please try again later."
              sx={{ paddingTop: 6 }}
            />
          ) : !data || data.length === 0 ? (
            <Fallbacks
              severity="info"
              title="No units found"
              description="There are no units to display."
              sx={{ paddingTop: 6 }}
            />
          ) : (
            <UnitTable units={data} fiscalYear={selectedYear.id} />
          )}

          {!loading && pagination.total > pagination.per_page && (
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